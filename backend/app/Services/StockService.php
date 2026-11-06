<?php

namespace App\Services;

use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockService
{
    /**
     * Applique un mouvement de stock (entrée, sortie ou inventaire).
     */
    public function adjust(Product $product, array $data): StockMovement
    {
        return DB::transaction(function () use ($product, $data) {
            /** @var Product $product */
            $product = Product::whereKey($product->id)->lockForUpdate()->firstOrFail();

            $before = $product->stock;
            $quantity = (int) $data['quantity'];
            $type = $data['type'];

            if ($type === 'in') {
                $after = $before + $quantity;
                $variation = $quantity;
                $defaultReason = 'Entrée de stock';
            } elseif ($type === 'out') {
                if ($quantity > $before) {
                    throw ValidationException::withMessages([
                        'quantity' => "Stock insuffisant : seulement {$before} unité(s) disponible(s).",
                    ]);
                }

                $after = $before - $quantity;
                $variation = -$quantity;
                $defaultReason = 'Sortie de stock';
            } else {
                $after = $quantity;
                $variation = $after - $before;
                $defaultReason = 'Correction d’inventaire';
            }

            $product->stock = $after;
            $product->save();

            return StockMovement::create([
                'product_id' => $product->id,
                'type' => $type,
                'quantity' => $variation,
                'stock_before' => $before,
                'stock_after' => $after,
                'reason' => $data['reason'] ?? $defaultReason,
            ])->load('product.category');
        });
    }

    public function recordInitialStock(Product $product): void
    {
        if ($product->stock < 1) {
            return;
        }

        StockMovement::create([
            'product_id' => $product->id,
            'type' => 'in',
            'quantity' => $product->stock,
            'stock_before' => 0,
            'stock_after' => $product->stock,
            'reason' => 'Stock initial',
        ]);
    }
}
