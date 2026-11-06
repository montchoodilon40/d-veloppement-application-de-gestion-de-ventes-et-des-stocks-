<?php

namespace Tests\Feature;

use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesCommercialData;
use Tests\TestCase;

class DashboardApiTest extends TestCase
{
    use CreatesCommercialData;
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_dashboard_returns_kpis_charts_and_alerts(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-29 12:00:00'));

        $client = $this->makeClient();
        $product = $this->makeProduct([
            'name' => 'Produit vedette',
            'purchase_price' => 50,
            'sale_price' => 100,
            'stock' => 5,
            'stock_alert' => 5,
        ]);
        $category = $this->makeCategory(['name' => 'Électronique']);
        $product->update(['category_id' => $category->id]);

        $this->postJson('/api/sales', [
            'client_id' => $client->id,
            'payment_method' => 'cash',
            'tax_rate' => 20,
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ])->assertCreated();

        $cancelledSale = $this->postJson('/api/sales', [
            'client_id' => $client->id,
            'payment_method' => 'card',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ])->json('data');

        $this->postJson("/api/sales/{$cancelledSale['id']}/cancel")->assertOk();

        $response = $this->getJson('/api/dashboard');

        $response
            ->assertOk()
            ->assertJsonPath('kpis.revenue_today', 120)
            ->assertJsonPath('kpis.sales_today', 1)
            ->assertJsonPath('kpis.revenue_month', 120)
            ->assertJsonPath('kpis.sales_month', 1)
            ->assertJsonPath('kpis.revenue_all_time', 120)
            ->assertJsonPath('kpis.sales_all_time', 1)
            ->assertJsonPath('kpis.average_basket', 120)
            ->assertJsonPath('kpis.products_count', 1)
            ->assertJsonPath('kpis.low_stock_count', 1)
            ->assertJsonPath('kpis.out_of_stock_count', 0)
            ->assertJsonPath('kpis.clients_count', 1)
            ->assertJsonPath('kpis.stock_value', 200)
            ->assertJsonCount(7, 'sales_last_7_days')
            ->assertJsonPath('sales_last_7_days.6.date', '2026-10-29')
            ->assertJsonPath('sales_last_7_days.6.total', 120)
            ->assertJsonCount(12, 'monthly_revenue')
            ->assertJsonPath('monthly_revenue.11.total', 120)
            ->assertJsonPath('top_products.0.name', 'Produit vedette')
            ->assertJsonPath('top_products.0.quantity', 1)
            ->assertJsonPath('top_products.0.revenue', 100)
            ->assertJsonPath('sales_by_category.0.name', 'Électronique')
            ->assertJsonPath('sales_by_category.0.revenue', 100)
            ->assertJsonPath('payment_breakdown.0.method', 'cash')
            ->assertJsonPath('payment_breakdown.0.total', 120)
            ->assertJsonCount(2, 'recent_sales')
            ->assertJsonCount(1, 'low_stock_products');
    }

    public function test_dashboard_growth_is_computed_against_the_previous_month(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-29 12:00:00'));

        $client = $this->makeClient();
        $product = $this->makeProduct(['stock' => 20, 'sale_price' => 100]);

        $this->postJson('/api/sales', [
            'client_id' => $client->id,
            'payment_method' => 'cash',
            'sale_date' => '2026-09-15 10:00:00',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ])->assertCreated();

        $this->postJson('/api/sales', [
            'client_id' => $client->id,
            'payment_method' => 'cash',
            'sale_date' => '2026-10-15 10:00:00',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2],
            ],
        ])->assertCreated();

        $this->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonPath('kpis.revenue_previous_month', 100)
            ->assertJsonPath('kpis.revenue_month', 200)
            ->assertJsonPath('kpis.revenue_growth', 100)
            ->assertJsonPath('kpis.revenue_today', 0)
            ->assertJsonPath('kpis.sales_today', 0);
    }
}
