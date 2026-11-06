<?php

namespace Tests\Feature;

use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesCommercialData;
use Tests\TestCase;

class CategoryApiTest extends TestCase
{
    use CreatesCommercialData;
    use RefreshDatabase;

    public function test_categories_can_be_created_updated_and_deleted(): void
    {
        $response = $this->postJson('/api/categories', [
            'name' => 'Papeterie',
            'color' => '#f59e0b',
            'description' => 'Fournitures de bureau',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.name', 'Papeterie')
            ->assertJsonPath('data.products_count', 0);

        $category = Category::firstOrFail();

        $this->putJson("/api/categories/{$category->id}", [
            'name' => 'Fournitures',
            'color' => '#f97316',
            'description' => 'Papeterie et bureau',
        ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Fournitures')
            ->assertJsonPath('data.color', '#f97316');

        $this->deleteJson("/api/categories/{$category->id}")->assertNoContent();
        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }

    public function test_categories_containing_products_cannot_be_deleted(): void
    {
        $category = $this->makeCategory();
        $product = $this->makeProduct(['category_id' => $category->id]);

        $this->deleteJson("/api/categories/{$category->id}")
            ->assertStatus(422)
            ->assertJsonPath('message', 'Impossible de supprimer cette catégorie car elle contient des produits.');

        $this->assertDatabaseHas('categories', ['id' => $category->id]);
        $this->assertSame($category->id, $product->fresh()->category_id);
    }

    public function test_category_index_counts_products(): void
    {
        $category = $this->makeCategory();
        $this->makeProduct(['category_id' => $category->id]);
        $this->makeProduct(['category_id' => $category->id]);

        $this->getJson('/api/categories')
            ->assertOk()
            ->assertJsonPath('data.0.products_count', 2);

        $this->getJson('/api/categories?all=1')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }
}
