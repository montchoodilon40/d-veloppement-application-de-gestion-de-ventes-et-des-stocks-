<?php

namespace Tests\Concerns;

use App\Models\Category;
use App\Models\Client;
use App\Models\Product;

trait CreatesCommercialData
{
    protected function makeCategory(array $overrides = []): Category
    {
        return Category::create(array_merge([
            'name' => 'Catégorie '.uniqid(),
            'color' => '#6366f1',
        ], $overrides));
    }

    protected function makeClient(array $overrides = []): Client
    {
        return Client::create(array_merge([
            'name' => 'Client de test',
            'email' => uniqid().'@example.fr',
            'phone' => '0600000000',
            'address' => '1 rue de test',
            'city' => 'Paris',
        ], $overrides));
    }

    protected function makeProduct(array $overrides = []): Product
    {
        return Product::create(array_merge([
            'reference' => 'PRD-TEST-'.uniqid(),
            'name' => 'Produit de test',
            'purchase_price' => 50,
            'sale_price' => 100,
            'stock' => 10,
            'stock_alert' => 2,
            'unit' => 'pièce',
            'is_active' => true,
        ], $overrides));
    }
}
