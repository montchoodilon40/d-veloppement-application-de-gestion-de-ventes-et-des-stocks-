<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'reference' => ['nullable', 'string', 'max:50', 'unique:products,reference'],
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:2000'],
            'purchase_price' => ['required', 'numeric', 'min:0', 'max:99999999'],
            'sale_price' => ['required', 'numeric', 'min:0', 'max:99999999'],
            'stock' => ['nullable', 'integer', 'min:0', 'max:1000000'],
            'stock_alert' => ['nullable', 'integer', 'min:0', 'max:1000000'],
            'unit' => ['nullable', 'string', 'max:30'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Le nom du produit est obligatoire.',
            'sale_price.required' => 'Le prix de vente est obligatoire.',
            'sale_price.min' => 'Le prix de vente ne peut pas être négatif.',
            'reference.unique' => 'Cette référence produit est déjà utilisée.',
            'category_id.exists' => 'La catégorie sélectionnée est invalide.',
        ];
    }
}
