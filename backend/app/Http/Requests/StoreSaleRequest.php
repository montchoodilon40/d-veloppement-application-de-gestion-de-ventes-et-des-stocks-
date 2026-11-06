<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client_id' => ['required', 'integer', 'exists:clients,id'],
            'sale_date' => ['nullable', 'date'],
            'discount_amount' => ['nullable', 'numeric', 'min:0', 'max:99999999'],
            'tax_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'payment_method' => ['required', 'in:cash,card,transfer,mobile_money,check'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'distinct', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:1000000'],
            'items.*.unit_price' => ['nullable', 'numeric', 'min:0', 'max:99999999'],
        ];
    }

    public function messages(): array
    {
        return [
            'client_id.required' => 'Veuillez sélectionner un client.',
            'client_id.exists' => 'Le client sélectionné est invalide.',
            'payment_method.required' => 'Veuillez choisir un mode de paiement.',
            'items.required' => 'La vente doit contenir au moins un produit.',
            'items.min' => 'La vente doit contenir au moins un produit.',
            'items.*.product_id.distinct' => 'Un produit ne peut apparaître qu’une seule fois dans la vente.',
            'items.*.quantity.min' => 'La quantité doit être au moins égale à 1.',
            'items.*.quantity.required' => 'La quantité est obligatoire.',
        ];
    }
}
