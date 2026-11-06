<?php

namespace Tests\Feature;

use App\Models\Client;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesCommercialData;
use Tests\TestCase;

class ClientApiTest extends TestCase
{
    use CreatesCommercialData;
    use RefreshDatabase;

    public function test_clients_can_be_created_updated_and_deleted(): void
    {
        $response = $this->postJson('/api/clients', [
            'name' => 'Alice Dupont',
            'email' => 'alice@example.fr',
            'phone' => '0611223344',
            'address' => '2 avenue de la Paix',
            'city' => 'Lyon',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.name', 'Alice Dupont')
            ->assertJsonPath('data.city', 'Lyon');

        $client = Client::firstOrFail();

        $this->putJson("/api/clients/{$client->id}", [
            'name' => 'Alice Martin',
            'email' => 'alice.martin@example.fr',
            'phone' => '0611223344',
            'address' => '2 avenue de la Paix',
            'city' => 'Lyon',
        ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Alice Martin')
            ->assertJsonPath('data.email', 'alice.martin@example.fr');

        $this->deleteJson("/api/clients/{$client->id}")->assertNoContent();
        $this->assertDatabaseMissing('clients', ['id' => $client->id]);
    }

    public function test_clients_with_sales_cannot_be_deleted(): void
    {
        $client = $this->makeClient();
        $product = $this->makeProduct();

        $this->postJson('/api/sales', [
            'client_id' => $client->id,
            'payment_method' => 'cash',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ])->assertCreated();

        $this->deleteJson("/api/clients/{$client->id}")
            ->assertStatus(422)
            ->assertJsonPath('message', 'Impossible de supprimer ce client car il possède des ventes enregistrées.');
    }

    public function test_client_detail_includes_recent_sales(): void
    {
        $client = $this->makeClient(['name' => 'Sophie Martin']);
        $product = $this->makeProduct(['sale_price' => 42, 'stock' => 5]);

        $sale = $this->postJson('/api/sales', [
            'client_id' => $client->id,
            'payment_method' => 'transfer',
            'tax_rate' => 20,
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2],
            ],
        ])->json('data');

        $response = $this->getJson("/api/clients/{$client->id}");

        $response
            ->assertOk()
            ->assertJsonPath('data.sales_count', 1)
            ->assertJsonPath('data.total_spent', 100.8)
            ->assertJsonCount(1, 'sales')
            ->assertJsonPath('sales.0.reference', $sale['reference'])
            ->assertJsonPath('sales.0.items_count', 1)
            ->assertJsonPath('sales.0.total', 100.8);
    }

    public function test_clients_can_be_searched(): void
    {
        $this->makeClient(['name' => 'Sophie Martin', 'city' => 'Paris']);
        $this->makeClient(['name' => 'Thomas Bernard', 'city' => 'Lyon']);

        $this->getJson('/api/clients?search=lyon')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Thomas Bernard');

        $this->getJson('/api/clients?all=1')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }
}
