<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'name' => $this->name,
            'description' => $this->description,
            'purchase_price' => (float) $this->purchase_price,
            'sale_price' => (float) $this->sale_price,
            'stock' => $this->stock,
            'stock_alert' => $this->stock_alert,
            'stock_status' => $this->stock_status,
            'stock_value' => $this->stock_value,
            'unit' => $this->unit,
            'is_active' => $this->is_active,
            'margin' => round((float) $this->sale_price - (float) $this->purchase_price, 2),
            'margin_rate' => (float) $this->purchase_price > 0
                ? round((((float) $this->sale_price - (float) $this->purchase_price) / (float) $this->purchase_price) * 100, 1)
                : null,
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', fn () => new CategoryResource($this->category)),
            'sales_count' => $this->when(isset($this->sale_items_count), fn () => $this->sale_items_count),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
