<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSaleRequest;
use App\Http\Resources\SaleResource;
use App\Models\Sale;
use App\Services\SaleService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SaleController extends Controller
{
    public function __construct(private readonly SaleService $saleService)
    {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $baseQuery = $this->filteredQuery($request);

        $summary = (clone $baseQuery)
            ->where('status', 'completed')
            ->selectRaw('COUNT(*) as sales_count, COALESCE(SUM(total), 0) as revenue')
            ->first();

        $query = (clone $baseQuery)->with('client')->withCount('items');

        $sortable = ['sale_date', 'total', 'reference', 'created_at'];
        $sort = in_array($request->input('sort'), $sortable, true) ? $request->input('sort') : 'sale_date';
        $direction = $request->input('direction') === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sort, $direction)->orderBy('id', $direction);

        $perPage = min(max($request->integer('per_page', 10), 1), 100);
        $sales = $query->paginate($perPage)->withQueryString();

        return SaleResource::collection($sales)->additional([
            'summary' => [
                'sales_count' => (int) ($summary->sales_count ?? 0),
                'revenue' => round((float) ($summary->revenue ?? 0), 2),
            ],
        ]);
    }

    public function store(StoreSaleRequest $request): JsonResponse
    {
        $sale = $this->saleService->create($request->validated());

        return (new SaleResource($sale->load(['client', 'items.product.category'])))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Sale $sale): SaleResource
    {
        return new SaleResource($sale->load(['client', 'items.product.category'])->loadCount('items'));
    }

    public function cancel(Sale $sale): JsonResponse
    {
        $sale = $this->saleService->cancel($sale);

        return response()->json([
            'message' => 'La vente a été annulée et le stock a été restauré.',
            'data' => new SaleResource($sale->load(['client', 'items.product.category'])),
        ]);
    }

    private function filteredQuery(Request $request): Builder
    {
        $query = Sale::query();

        if ($search = $request->string('search')->trim()->toString()) {
            $query->search($search);
        }

        if ($status = $request->string('status')->trim()->toString()) {
            if (in_array($status, ['completed', 'cancelled'], true)) {
                $query->where('status', $status);
            }
        }

        if ($paymentMethod = $request->string('payment_method')->trim()->toString()) {
            $query->where('payment_method', $paymentMethod);
        }

        if ($clientId = $request->integer('client_id')) {
            $query->where('client_id', $clientId);
        }

        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('sale_date', '>=', $dateFrom);
        }

        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('sale_date', '<=', $dateTo);
        }

        return $query;
    }
}
