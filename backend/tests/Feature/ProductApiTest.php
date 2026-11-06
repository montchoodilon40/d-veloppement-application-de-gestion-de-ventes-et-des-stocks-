<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesCommercialData;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use CreatesCommercialData;
    use RefreshDatabase;

    public function test_products_can_be_created_with_an_initial_stock_movement(): void
    {
        $category = Category::create([
            'name' => 'Électronique',
            'color' => '#6366f1',
        ]);

        $response = $this->postJson('/api/products', [
            'name' => 'Clavier mécanique',
            'category_id' => $category->id,
            'purchase_price' => 45.50,
            'sale_price' => 79.90,
            'stock' => 12,
            'stock_alert' => 3,
            'unit' => 'pièce',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.name', 'Clavier mécanique')
            ->assertJsonPath('data.stock', 12)
            ->assertJsonPath('data.category.id', $category->id);

        $product = Product::firstOrFail();

        $this->assertNotEmpty($product->reference);
        $this->assertDatabaseHas('stock_movements', [
            'product_id' => $product->id,
            'type' => 'in',
            'quantity' => 12,
            'stock_before' => 0,
            'stock_after' => 12,
            'reason' => 'Stock initial',
        ]);
    }

    public function test_products_can_be_updated_without_changing_their_stock(): void
    {
        $product = $this->makeProduct(['stock' => 7]);

        $response = $this->putJson("/api/products/{$product->id}", [
            'name' => 'Nom mis à jour',
            'purchase_price' => 10,
            'sale_price' => 25,
            'stock_alert' => 4,
            'unit' => 'pièce',
            'is_active' => false,
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.name', 'Nom mis à jour')
            ->assertJsonPath('data.stock', 7)
            ->assertJsonPath('data.is_active', false);
    }

    public function test_products_with_sales_cannot_be_deleted(): void
    {
        $client = $this->makeClient();
        $product = $this->makeProduct();

        $this->postJson('/api/sales', [
            'client_id' => $client->id,
            'payment_method' => 'cash',
            'tax_rate' => 20,
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ])->assertCreated();

        $this->deleteJson("/api/products/{$product->id}")
            ->assertStatus(422)
            ->assertJsonPath('message', 'Impossible de supprimer ce produit car il est utilisé dans des ventes. Vous pouvez le désactiver.');
    }

    public function test_alert_filter_returns_low_and_out_of_stock_products(): void
    {
        $out = $this->makeProduct(['name' => 'Produit épuisé', 'stock' => 0, 'stock_alert' => 5]);
        $low = $this->makeProduct(['name' => 'Produit faible', 'stock' => 2, 'stock_alert' => 5]);
        $this->makeProduct(['name' => 'Produit disponible', 'stock' => 20, 'stock_alert' => 5]);

        $response = $this->getJson('/api/products?status=alert');

        $response->assertOk()->assertJsonCount(2, 'data');

        $this->assertEqualsCanonicalizing(
            [$out->id, $low->id],
            collect($response->json('data'))->pluck('id')->all()
        );

        $this->getJson('/api/products?status=low')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $low->id);

        $this->getJson('/api/products?status=out')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $out->id);
    }

    public function test_stock_adjustments_are_recorded_and_cannot_make_stock_negative(): void
    {
        $product = $this->makeProduct(['stock' => 5]);

        $this->postJson("/api/products/{$product->id}/stock-adjustments", [
            'type' => 'in',
            'quantity' => 7,
            'reason' => 'Réapprovisionnement',
        ])->assertOk()->assertJsonPath('product.stock', 12);

        $this->postJson("/api/products/{$product->id}/stock-adjustments", [
            'type' => 'out',
            'quantity' => 2,
            'reason' => 'Casse',
        ])->assertOk()->assertJsonPath('product.stock', 10);

        $this->postJson("/api/products/{$product->id}/stock-adjustments", [
            'type' => 'adjustment',
            'quantity' => 3,
            'reason' => 'Inventaire',
        ])->assertOk()->assertJsonPath('product.stock', 3);

        $this->postJson("/api/products/{$product->id}/stock-adjustments", [
            'type' => 'out',
            'quantity' => 4,
        ])->assertStatus(422);

        $this->assertSame(3, $product->fresh()->stock);
        $this->assertDatabaseCount('stock_movements', 3);
        $this->assertDatabaseHas('stock_movements', [
            'product_id' => $product->id,
            'type' => 'adjustment',
            'quantity' => -7,
            'stock_before' => 10,
            'stock_after' => 3,
        ]);
    }
}
