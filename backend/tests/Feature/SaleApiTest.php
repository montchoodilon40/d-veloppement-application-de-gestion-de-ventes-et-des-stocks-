<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Sale;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesCommercialData;
use Tests\TestCase;

class SaleApiTest extends TestCase
{
    use CreatesCommercialData;
    use RefreshDatabase;

    public function test_a_sale_decrements_stock_and_computes_totals(): void
    {
        $client = $this->makeClient();
        $keyboard = $this->makeProduct(['name' => 'Clavier', 'sale_price' => 100, 'stock' => 10]);
        $mouse = $this->makeProduct(['name' => 'Souris', 'sale_price' => 50, 'stock' => 5]);

        $response = $this->postJson('/api/sales', [
            'client_id' => $client->id,
            'payment_method' => 'card',
            'discount_amount' => 10,
            'tax_rate' => 20,
            'notes' => 'Vente de test',
            'items' => [
                ['product_id' => $keyboard->id, 'quantity' => 2],
                ['product_id' => $mouse->id, 'quantity' => 1],
            ],
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.client.id', $client->id)
            ->assertJsonPath('data.subtotal', 250)
            ->assertJsonPath('data.discount_amount', 10)
            ->assertJsonPath('data.tax_amount', 48)
            ->assertJsonPath('data.total', 288)
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonCount(2, 'data.items');

        $this->assertStringStartsWith('VTE-', $response->json('data.reference'));
        $this->assertSame(8, $keyboard->fresh()->stock);
        $this->assertSame(4, $mouse->fresh()->stock);
        $this->assertDatabaseCount('stock_movements', 2);
        $this->assertDatabaseHas('stock_movements', [
            'product_id' => $keyboard->id,
            'type' => 'out',
            'quantity' => -2,
            'stock_before' => 10,
            'stock_after' => 8,
        ]);
    }

    public function test_a_sale_is_rejected_when_stock_is_insufficient(): void
    {
        $client = $this->makeClient();
        $product = $this->makeProduct(['stock' => 3]);

        $this->postJson('/api/sales', [
            'client_id' => $client->id,
            'payment_method' => 'cash',
            'tax_rate' => 20,
            'items' => [
                ['product_id' => $product->id, 'quantity' => 4],
            ],
        ])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Stock insuffisant pour « Produit de test » : 3 disponible(s), 4 demandé(s).');

        $this->assertDatabaseCount('sales', 0);
        $this->assertDatabaseCount('sale_items', 0);
        $this->assertDatabaseCount('stock_movements', 0);
        $this->assertSame(3, $product->fresh()->stock);
    }

    public function test_inactive_products_cannot_be_sold(): void
    {
        $client = $this->makeClient();
        $product = $this->makeProduct(['is_active' => false]);

        $this->postJson('/api/sales', [
            'client_id' => $client->id,
            'payment_method' => 'cash',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ])->assertStatus(422);

        $this->assertDatabaseCount('sales', 0);
        $this->assertSame(10, $product->fresh()->stock);
    }

    public function test_a_discount_cannot_exceed_the_subtotal(): void
    {
        $client = $this->makeClient();
        $product = $this->makeProduct(['sale_price' => 100]);

        $this->postJson('/api/sales', [
            'client_id' => $client->id,
            'payment_method' => 'cash',
            'discount_amount' => 150,
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('discount_amount');

        $this->assertDatabaseCount('sales', 0);
    }

    public function test_cancelling_a_sale_restores_stock_and_records_a_movement(): void
    {
        $client = $this->makeClient();
        $product = $this->makeProduct(['stock' => 10]);

        $sale = $this->postJson('/api/sales', [
            'client_id' => $client->id,
            'payment_method' => 'cash',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 3],
            ],
        ])->assertCreated()->json('data');

        $this->assertSame(7, $product->fresh()->stock);

        $this->postJson("/api/sales/{$sale['id']}/cancel")
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled');

        $this->assertSame(10, $product->fresh()->stock);
        $this->assertDatabaseHas('stock_movements', [
            'sale_id' => $sale['id'],
            'product_id' => $product->id,
            'type' => 'in',
            'quantity' => 3,
            'stock_before' => 7,
            'stock_after' => 10,
        ]);

        $this->postJson("/api/sales/{$sale['id']}/cancel")
            ->assertStatus(422)
            ->assertJsonPath('message', 'Cette vente est déjà annulée.');
    }

    public function test_sales_index_filters_and_summary_only_count_completed_sales(): void
    {
        $client = $this->makeClient();
        $product = $this->makeProduct(['stock' => 20, 'sale_price' => 100]);

        $completed = $this->postJson('/api/sales', [
            'client_id' => $client->id,
            'payment_method' => 'card',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ])->json('data');

        $toCancel = $this->postJson('/api/sales', [
            'client_id' => $client->id,
            'payment_method' => 'cash',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2],
            ],
        ])->json('data');

        $this->postJson("/api/sales/{$toCancel['id']}/cancel")->assertOk();

        $response = $this->getJson('/api/sales?status=completed');

        $response
            ->assertOk()
            ->assertJsonPath('summary.sales_count', 1)
            ->assertJsonPath('summary.revenue', 100)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.reference', $completed['reference']);

        $this->getJson('/api/sales?status=cancelled')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $toCancel['id']);
    }

    public function test_cancelled_sales_are_excluded_from_client_total_spent(): void
    {
        $client = $this->makeClient();
        $product = $this->makeProduct(['stock' => 10, 'sale_price' => 100]);

        $sale = $this->postJson('/api/sales', [
            'client_id' => $client->id,
            'payment_method' => 'cash',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2],
            ],
        ])->json('data');

        $this->postJson("/api/sales/{$sale['id']}/cancel")->assertOk();

        $this->getJson("/api/clients/{$client->id}")
            ->assertOk()
            ->assertJsonPath('data.sales_count', 0)
            ->assertJsonPath('data.total_spent', 0)
            ->assertJsonCount(1, 'sales');

        $this->assertSame(1, Sale::count());
    }
}
