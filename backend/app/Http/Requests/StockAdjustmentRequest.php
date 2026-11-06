<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StockAdjustmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'in:in,out,adjustment'],
            'quantity' => ['required', 'integer', 'min:0'],
            'reason' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (in_array($this->input('type'), ['in', 'out']) && (int) $this->input('quantity') < 1) {
                $validator->errors()->add('quantity', 'La quantité doit être au moins égale à 1.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'type.required' => 'Le type de mouvement est obligatoire.',
            'type.in' => 'Le type de mouvement est invalide.',
            'quantity.required' => 'La quantité est obligatoire.',
            'quantity.min' => 'La quantité ne peut pas être négative.',
        ];
    }
}
