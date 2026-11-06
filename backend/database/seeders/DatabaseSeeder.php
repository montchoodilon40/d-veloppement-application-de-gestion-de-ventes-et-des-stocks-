<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Client;
use App\Models\Product;
use App\Models\Sale;
use App\Models\StockMovement;
use App\Services\SaleService;
use App\Services\StockService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $categories = collect([
            ['name' => 'Électronique', 'color' => '#6366f1', 'description' => 'Appareils électroniques et objets connectés.'],
            ['name' => 'Informatique', 'color' => '#0ea5e9', 'description' => 'Matériel et périphériques informatiques.'],
            ['name' => 'Accessoires', 'color' => '#f59e0b', 'description' => 'Accessoires du quotidien et connectivité.'],
            ['name' => 'Mobilier', 'color' => '#10b981', 'description' => 'Mobilier de bureau et de maison.'],
            ['name' => 'Papeterie', 'color' => '#ef4444', 'description' => 'Fournitures et articles de bureau.'],
        ])->mapWithKeys(function (array $category) {
            $model = Category::firstOrCreate(['name' => $category['name']], $category);

            return [$model->name => $model];
        });

        $productsData = [
            ['reference' => 'ELE-001', 'name' => 'Smartphone Nova X', 'category' => 'Électronique', 'purchase_price' => 320, 'sale_price' => 449, 'stock' => 35, 'stock_alert' => 5, 'unit' => 'pièce'],
            ['reference' => 'ELE-002', 'name' => 'Casque Bluetooth AirBeat', 'category' => 'Électronique', 'purchase_price' => 45, 'sale_price' => 79.90, 'stock' => 42, 'stock_alert' => 8, 'unit' => 'pièce'],
            ['reference' => 'ELE-003', 'name' => 'Enceinte portable Pulse', 'category' => 'Électronique', 'purchase_price' => 28, 'sale_price' => 49.90, 'stock' => 60, 'stock_alert' => 10, 'unit' => 'pièce'],
            ['reference' => 'ELE-004', 'name' => 'Montre connectée FitPro', 'category' => 'Électronique', 'purchase_price' => 65, 'sale_price' => 109, 'stock' => 25, 'stock_alert' => 6, 'unit' => 'pièce'],
            ['reference' => 'INF-001', 'name' => 'Ordinateur portable ZenBook 14', 'category' => 'Informatique', 'purchase_price' => 780, 'sale_price' => 1049, 'stock' => 18, 'stock_alert' => 4, 'unit' => 'pièce'],
            ['reference' => 'INF-002', 'name' => 'Souris sans fil Ergo', 'category' => 'Informatique', 'purchase_price' => 12, 'sale_price' => 24.90, 'stock' => 70, 'stock_alert' => 15, 'unit' => 'pièce'],
            ['reference' => 'INF-003', 'name' => 'Clavier mécanique RGB', 'category' => 'Informatique', 'purchase_price' => 38, 'sale_price' => 69.90, 'stock' => 32, 'stock_alert' => 8, 'unit' => 'pièce'],
            ['reference' => 'INF-004', 'name' => 'Écran 27 pouces UltraSharp', 'category' => 'Informatique', 'purchase_price' => 210, 'sale_price' => 329, 'stock' => 14, 'stock_alert' => 3, 'unit' => 'pièce'],
            ['reference' => 'INF-005', 'name' => 'SSD externe 1 To', 'category' => 'Informatique', 'purchase_price' => 55, 'sale_price' => 89.90, 'stock' => 45, 'stock_alert' => 10, 'unit' => 'pièce'],
            ['reference' => 'ACC-001', 'name' => 'Chargeur USB-C 65W', 'category' => 'Accessoires', 'purchase_price' => 15, 'sale_price' => 29.90, 'stock' => 90, 'stock_alert' => 20, 'unit' => 'pièce'],
            ['reference' => 'ACC-002', 'name' => 'Câble HDMI 2m', 'category' => 'Accessoires', 'purchase_price' => 4, 'sale_price' => 12.90, 'stock' => 120, 'stock_alert' => 25, 'unit' => 'pièce'],
            ['reference' => 'ACC-003', 'name' => 'Powerbank 20 000 mAh', 'category' => 'Accessoires', 'purchase_price' => 22, 'sale_price' => 39.90, 'stock' => 50, 'stock_alert' => 12, 'unit' => 'pièce'],
            ['reference' => 'ACC-004', 'name' => 'Support téléphone', 'category' => 'Accessoires', 'purchase_price' => 6, 'sale_price' => 14.90, 'stock' => 80, 'stock_alert' => 15, 'unit' => 'pièce'],
            ['reference' => 'ACC-005', 'name' => 'Sac à dos urbain', 'category' => 'Accessoires', 'purchase_price' => 25, 'sale_price' => 49.90, 'stock' => 28, 'stock_alert' => 6, 'unit' => 'pièce'],
            ['reference' => 'MOB-001', 'name' => 'Bureau compact', 'category' => 'Mobilier', 'purchase_price' => 120, 'sale_price' => 199, 'stock' => 9, 'stock_alert' => 2, 'unit' => 'pièce'],
            ['reference' => 'MOB-002', 'name' => 'Chaise ergonomique', 'category' => 'Mobilier', 'purchase_price' => 180, 'sale_price' => 299, 'stock' => 7, 'stock_alert' => 3, 'unit' => 'pièce'],
            ['reference' => 'MOB-003', 'name' => 'Lampe LED de bureau', 'category' => 'Mobilier', 'purchase_price' => 18, 'sale_price' => 34.90, 'stock' => 40, 'stock_alert' => 8, 'unit' => 'pièce'],
            ['reference' => 'PAP-001', 'name' => 'Carnet de notes A5', 'category' => 'Papeterie', 'purchase_price' => 3, 'sale_price' => 7.90, 'stock' => 100, 'stock_alert' => 20, 'unit' => 'pièce'],
            ['reference' => 'PAP-002', 'name' => 'Stylos gel (lot de 5)', 'category' => 'Papeterie', 'purchase_price' => 2, 'sale_price' => 6.50, 'stock' => 150, 'stock_alert' => 30, 'unit' => 'lot'],
            ['reference' => 'PAP-003', 'name' => 'Bloc-notes autocollants', 'category' => 'Papeterie', 'purchase_price' => 1.50, 'sale_price' => 4.90, 'stock' => 90, 'stock_alert' => 20, 'unit' => 'lot'],
        ];

        $stockService = app(StockService::class);

        $products = collect($productsData)->mapWithKeys(function (array $data) use ($categories, $stockService) {
            $category = $categories[$data['category']];
            unset($data['category']);

            $product = Product::firstOrCreate(
                ['reference' => $data['reference']],
                array_merge($data, ['category_id' => $category->id, 'is_active' => true])
            );

            if ($product->wasRecentlyCreated) {
                $stockService->recordInitialStock($product);
            }

            return [$product->reference => $product];
        });

        $clientsData = [
            ['name' => 'Sophie Martin', 'email' => 'sophie.martin@example.fr', 'phone' => '06 12 34 56 78', 'address' => '12 rue des Lilas', 'city' => 'Paris'],
            ['name' => 'Thomas Bernard', 'email' => 'thomas.bernard@example.fr', 'phone' => '06 23 45 67 89', 'address' => '8 avenue Jean Jaurès', 'city' => 'Lyon'],
            ['name' => 'Camille Dubois', 'email' => 'camille.dubois@example.fr', 'phone' => '06 34 56 78 90', 'address' => '45 boulevard de la Mer', 'city' => 'Marseille'],
            ['name' => 'Nicolas Petit', 'email' => 'nicolas.petit@example.fr', 'phone' => '06 45 67 89 01', 'address' => '3 place du Capitole', 'city' => 'Toulouse'],
            ['name' => 'Léa Moreau', 'email' => 'lea.moreau@example.fr', 'phone' => '06 56 78 90 12', 'address' => '21 cours de l’Intendance', 'city' => 'Bordeaux'],
            ['name' => 'Ahmed Benali', 'email' => 'ahmed.benali@example.fr', 'phone' => '06 67 89 01 23', 'address' => '7 rue Nationale', 'city' => 'Lille'],
            ['name' => 'Emma Roux', 'email' => 'emma.roux@example.fr', 'phone' => '06 78 90 12 34', 'address' => '16 rue Crébillon', 'city' => 'Nantes'],
            ['name' => 'Lucas Fontaine', 'email' => 'lucas.fontaine@example.fr', 'phone' => '06 89 01 23 45', 'address' => '5 rue des Grandes Arcades', 'city' => 'Strasbourg'],
            ['name' => 'Chloé Girard', 'email' => 'chloe.girard@example.fr', 'phone' => '06 90 12 34 56', 'address' => '10 promenade des Anglais', 'city' => 'Nice'],
            ['name' => 'Mehdi Lambert', 'email' => 'mehdi.lambert@example.fr', 'phone' => '07 01 23 45 67', 'address' => '2 rue de la Monnaie', 'city' => 'Rennes'],
        ];

        $clients = collect($clientsData)->map(function (array $data) {
            return Client::firstOrCreate(['email' => $data['email']], $data);
        });

        if (Sale::count() === 0) {
            mt_srand(42);
            $this->seedSales($products, $clients, $stockService);
        }

        $this->seedLowStock($products, $stockService);
    }

    private function seedSales($products, $clients, StockService $stockService): void
    {
        $saleService = app(SaleService::class);
        $paymentMethods = ['cash', 'card', 'card', 'card', 'transfer', 'mobile_money', 'check'];
        $now = Carbon::now();

        $dates = [];
        for ($i = 0; $i < 3; $i++) {
            // Ventes du jour réparties dans les heures précédentes pour rester cohérentes.
            $dates[] = $now->copy()->subMinutes(40 + $i * 75 + mt_rand(0, 20))->setSecond(0);
        }
        for ($i = 1; $i <= 5; $i++) {
            $dates[] = $now->copy()->subDays($i)->setTime(mt_rand(9, 18), mt_rand(0, 59));
        }
        for ($i = 0; $i < 8; $i++) {
            $dates[] = $now->copy()->subDays(mt_rand(7, 28))->setTime(mt_rand(9, 18), mt_rand(0, 59));
        }
        for ($i = 0; $i < 9; $i++) {
            $dates[] = $now->copy()->subMonths(mt_rand(1, 5))->subDays(mt_rand(0, 27))->setTime(mt_rand(9, 18), mt_rand(0, 59));
        }

        $cancelled = null;

        foreach ($dates as $index => $date) {
            // On ne pioche que dans le stock réellement disponible.
            $available = Product::query()
                ->whereIn('id', $products->pluck('id'))
                ->where('stock', '>', 0)
                ->orderBy('id')
                ->get()
                ->values();

            $count = min(mt_rand(1, 3), $available->count());
            $keys = (array) array_rand($available->all(), $count);

            $items = collect($keys)->map(function (int $key) use ($available) {
                $product = $available[$key];

                return [
                    'product_id' => $product->id,
                    'quantity' => mt_rand(1, min(3, $product->stock)),
                    'unit_price' => (float) $product->sale_price,
                ];
            })->values()->all();

            $subtotal = collect($items)->sum(fn ($item) => $item['quantity'] * $item['unit_price']);
            $discount = $subtotal > 250 ? round($subtotal * 0.05, 2) : 0;

            $sale = $saleService->create([
                'client_id' => $clients[array_rand($clients->all())]->id,
                'sale_date' => $date->toDateTimeString(),
                'discount_amount' => $discount,
                'tax_rate' => 20,
                'payment_method' => $paymentMethods[array_rand($paymentMethods)],
                'notes' => $index % 7 === 0 ? 'Commande livrée en boutique.' : null,
                'items' => $items,
            ]);

            Sale::whereKey($sale->id)->update(['created_at' => $date, 'updated_at' => $date]);
            StockMovement::where('sale_id', $sale->id)->update(['created_at' => $date, 'updated_at' => $date]);

            if ($index === 12) {
                $cancelled = $sale;
            }
        }

        if ($cancelled) {
            $saleService->cancel($cancelled);
            StockMovement::where('sale_id', $cancelled->id)
                ->where('type', 'in')
                ->update(['created_at' => $cancelled->sale_date, 'updated_at' => $cancelled->sale_date]);
        }

        $stockService->adjust($products['ELE-003'], [
            'type' => 'in',
            'quantity' => 20,
            'reason' => 'Réapprovisionnement fournisseur',
        ]);
    }

    private function seedLowStock($products, StockService $stockService): void
    {
        $targets = [
            'ELE-002' => 5,
            'INF-002' => 0,
            'INF-005' => 8,
            'MOB-001' => 1,
            'PAP-001' => 12,
        ];

        foreach ($targets as $reference => $target) {
            $product = $products[$reference];

            if ($product->stock === $target) {
                continue;
            }

            $stockService->adjust($product, [
                'type' => 'adjustment',
                'quantity' => $target,
                'reason' => 'Inventaire de démonstration',
            ]);
        }
    }
}
