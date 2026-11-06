<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductResource;
use App\Http\Resources\SaleResource;
use App\Models\Client;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $now = now();
        $today = $now->copy()->startOfDay();
        $monthStart = $now->copy()->startOfMonth();
        $monthEnd = $now->copy()->endOfMonth();
        $previousMonthStart = $now->copy()->subMonthNoOverflow()->startOfMonth();
        $previousMonthEnd = $now->copy()->subMonthNoOverflow()->endOfMonth();

        $completed = Sale::query()->where('status', 'completed');

        $revenueToday = round((float) (clone $completed)->whereDate('sale_date', $today)->sum('total'), 2);
        $salesToday = (clone $completed)->whereDate('sale_date', $today)->count();
        $revenueMonth = round((float) (clone $completed)->whereBetween('sale_date', [$monthStart, $monthEnd])->sum('total'), 2);
        $salesMonth = (clone $completed)->whereBetween('sale_date', [$monthStart, $monthEnd])->count();
        $revenuePreviousMonth = round((float) (clone $completed)->whereBetween('sale_date', [$previousMonthStart, $previousMonthEnd])->sum('total'), 2);
        $revenueAllTime = round((float) (clone $completed)->sum('total'), 2);
        $salesAllTime = (clone $completed)->count();

        $growth = $revenuePreviousMonth > 0
            ? round((($revenueMonth - $revenuePreviousMonth) / $revenuePreviousMonth) * 100, 1)
            : ($revenueMonth > 0 ? 100.0 : 0.0);

        $stockValue = round((float) Product::query()
            ->selectRaw('COALESCE(SUM(purchase_price * stock), 0) as value')
            ->value('value'), 2);

        $kpis = [
            'revenue_today' => $revenueToday,
            'sales_today' => $salesToday,
            'revenue_month' => $revenueMonth,
            'sales_month' => $salesMonth,
            'revenue_previous_month' => $revenuePreviousMonth,
            'revenue_growth' => $growth,
            'revenue_all_time' => $revenueAllTime,
            'sales_all_time' => $salesAllTime,
            'average_basket' => $salesMonth > 0 ? round($revenueMonth / $salesMonth, 2) : 0,
            'products_count' => Product::count(),
            'active_products_count' => Product::where('is_active', true)->count(),
            'low_stock_count' => Product::whereColumn('stock', '<=', 'stock_alert')->where('stock', '>', 0)->count(),
            'out_of_stock_count' => Product::where('stock', '<=', 0)->count(),
            'clients_count' => Client::count(),
            'new_clients_month' => Client::whereBetween('created_at', [$monthStart, $monthEnd])->count(),
            'stock_value' => $stockValue,
        ];

        $salesLast7Days = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = $now->copy()->subDays($i)->startOfDay();
            $salesLast7Days[] = [
                'date' => $date->format('Y-m-d'),
                'total' => round((float) (clone $completed)->whereDate('sale_date', $date)->sum('total'), 2),
                'count' => (clone $completed)->whereDate('sale_date', $date)->count(),
            ];
        }

        $monthlyRevenue = [];
        for ($i = 11; $i >= 0; $i--) {
            $start = $now->copy()->subMonthsNoOverflow($i)->startOfMonth();
            $end = $now->copy()->subMonthsNoOverflow($i)->endOfMonth();
            $monthlyRevenue[] = [
                'month' => $start->format('Y-m'),
                'total' => round((float) (clone $completed)->whereBetween('sale_date', [$start, $end])->sum('total'), 2),
                'count' => (clone $completed)->whereBetween('sale_date', [$start, $end])->count(),
            ];
        }

        $topProducts = SaleItem::query()
            ->join('sales', 'sales.id', '=', 'sale_items.sale_id')
            ->where('sales.status', 'completed')
            ->whereBetween('sales.sale_date', [$monthStart, $monthEnd])
            ->selectRaw('sale_items.product_id, sale_items.product_name, sale_items.product_reference, SUM(sale_items.quantity) as quantity, SUM(sale_items.line_total) as revenue')
            ->groupBy('sale_items.product_id', 'sale_items.product_name', 'sale_items.product_reference')
            ->orderByDesc('revenue')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'product_id' => (int) $row->product_id,
                'name' => $row->product_name,
                'reference' => $row->product_reference,
                'quantity' => (int) $row->quantity,
                'revenue' => round((float) $row->revenue, 2),
            ]);

        $salesByCategory = SaleItem::query()
            ->join('sales', 'sales.id', '=', 'sale_items.sale_id')
            ->join('products', 'products.id', '=', 'sale_items.product_id')
            ->leftJoin('categories', 'categories.id', '=', 'products.category_id')
            ->where('sales.status', 'completed')
            ->whereBetween('sales.sale_date', [$monthStart, $monthEnd])
            ->selectRaw("COALESCE(categories.name, 'Sans catégorie') as name, COALESCE(categories.color, '#94a3b8') as color, SUM(sale_items.line_total) as revenue, SUM(sale_items.quantity) as quantity")
            ->groupBy('categories.id', 'categories.name', 'categories.color')
            ->orderByDesc('revenue')
            ->get()
            ->map(fn ($row) => [
                'name' => $row->name,
                'color' => $row->color,
                'revenue' => round((float) $row->revenue, 2),
                'quantity' => (int) $row->quantity,
            ]);

        $paymentBreakdown = (clone $completed)
            ->whereBetween('sale_date', [$monthStart, $monthEnd])
            ->selectRaw('payment_method, COUNT(*) as count, COALESCE(SUM(total), 0) as total')
            ->groupBy('payment_method')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'method' => $row->payment_method,
                'count' => (int) $row->count,
                'total' => round((float) $row->total, 2),
            ]);

        $recentSales = Sale::query()
            ->with('client')
            ->withCount('items')
            ->latest('sale_date')
            ->limit(6)
            ->get();

        $lowStockProducts = Product::query()
            ->with('category')
            ->whereColumn('stock', '<=', 'stock_alert')
            ->orderByRaw('CASE WHEN stock = 0 THEN 0 ELSE 1 END')
            ->orderBy('stock')
            ->limit(6)
            ->get();

        return response()->json([
            'kpis' => $kpis,
            'sales_last_7_days' => $salesLast7Days,
            'monthly_revenue' => $monthlyRevenue,
            'top_products' => $topProducts,
            'sales_by_category' => $salesByCategory,
            'payment_breakdown' => $paymentBreakdown,
            'recent_sales' => SaleResource::collection($recentSales)->resolve(),
            'low_stock_products' => ProductResource::collection($lowStockProducts)->resolve(),
            'generated_at' => $now->toIso8601String(),
        ]);
    }
}
