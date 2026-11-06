<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Sale;
use App\Models\StockMovement;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class SaleService
{
    /**
     * Enregistre une vente et met à jour le stock de manière atomique.
     */
    public function create(array $data): Sale
    {
        return DB::transaction(function () use ($data) {
            $items = collect($data['items'])->sortBy('product_id')->values();
            $products = Product::whereIn('id', $items->pluck('product_id'))
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $saleDate = isset($data['sale_date'])
                ? Carbon::parse($data['sale_date'])
                : now();

            $preparedItems = [];
            $subtotal = 0.0;

            foreach ($items as $item) {
                /** @var Product|null $product */
                $product = $products->get($item['product_id']);

                if (! $product) {
                    throw ValidationException::withMessages([
                        'items' => 'Un produit sélectionné n’existe plus.',
                    ]);
                }

                if (! $product->is_active) {
                    throw ValidationException::withMessages([
                        'items' => "Le produit « {$product->name} » est inactif et ne peut pas être vendu.",
                    ]);
                }

                $quantity = (int) $item['quantity'];

                if ($quantity > $product->stock) {
                    throw ValidationException::withMessages([
                        'items' => "Stock insuffisant pour « {$product->name} » : {$product->stock} disponible(s), {$quantity} demandé(s).",
                    ]);
                }

                $unitPrice = array_key_exists('unit_price', $item) && $item['unit_price'] !== null
                    ? round((float) $item['unit_price'], 2)
                    : round((float) $product->sale_price, 2);

                $lineTotal = round($unitPrice * $quantity, 2);
                $subtotal += $lineTotal;

                $preparedItems[] = [
                    'product' => $product,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'line_total' => $lineTotal,
                ];
            }

            $subtotal = round($subtotal, 2);
            $discount = round((float) ($data['discount_amount'] ?? 0), 2);

            if ($discount > $subtotal) {
                throw ValidationException::withMessages([
                    'discount_amount' => 'La remise ne peut pas dépasser le sous-total de la vente.',
                ]);
            }

            $taxRate = round((float) ($data['tax_rate'] ?? 0), 2);
            $taxableBase = round($subtotal - $discount, 2);
            $taxAmount = round($taxableBase * $taxRate / 100, 2);
            $total = round($taxableBase + $taxAmount, 2);

            $sale = Sale::create([
                'reference' => $this->generateReference($saleDate),
                'client_id' => $data['client_id'],
                'sale_date' => $saleDate,
                'subtotal' => $subtotal,
                'discount_amount' => $discount,
                'tax_rate' => $taxRate,
                'tax_amount' => $taxAmount,
                'total' => $total,
                'payment_method' => $data['payment_method'],
                'status' => 'completed',
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($preparedItems as $prepared) {
                $product = $prepared['product'];
                $stockBefore = $product->stock;

                $sale->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_reference' => $product->reference,
                    'quantity' => $prepared['quantity'],
                    'unit_price' => $prepared['unit_price'],
                    'line_total' => $prepared['line_total'],
                ]);

                $product->stock = $stockBefore - $prepared['quantity'];
                $product->save();

                StockMovement::create([
                    'product_id' => $product->id,
                    'sale_id' => $sale->id,
                    'type' => 'out',
                    'quantity' => -$prepared['quantity'],
                    'stock_before' => $stockBefore,
                    'stock_after' => $product->stock,
                    'reason' => "Vente {$sale->reference}",
                ]);
            }

            return $sale->load(['client', 'items']);
        });
    }

    /**
     * Annule une vente et réintègre les quantités dans le stock.
     */
    public function cancel(Sale $sale): Sale
    {
        return DB::transaction(function () use ($sale) {
            /** @var Sale $sale */
            $sale = Sale::whereKey($sale->id)->lockForUpdate()->firstOrFail();

            if ($sale->status === 'cancelled') {
                throw ValidationException::withMessages([
                    'sale' => 'Cette vente est déjà annulée.',
                ]);
            }

            $sale->load('items');
            $products = Product::whereIn('id', $sale->items->pluck('product_id'))
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            foreach ($sale->items as $item) {
                $product = $products->get($item->product_id);

                if (! $product) {
                    continue;
                }

                $stockBefore = $product->stock;
                $product->stock = $stockBefore + $item->quantity;
                $product->save();

                StockMovement::create([
                    'product_id' => $product->id,
                    'sale_id' => $sale->id,
                    'type' => 'in',
                    'quantity' => $item->quantity,
                    'stock_before' => $stockBefore,
                    'stock_after' => $product->stock,
                    'reason' => "Annulation de la vente {$sale->reference}",
                ]);
            }

            $sale->status = 'cancelled';
            $sale->save();

            return $sale->load(['client', 'items']);
        });
    }

    private function generateReference(Carbon $date): string
    {
        $prefix = 'VTE-'.$date->format('Ymd').'-';

        do {
            $reference = $prefix.strtoupper(Str::random(5));
        } while (Sale::where('reference', $reference)->exists());

        return $reference;
    }
}
