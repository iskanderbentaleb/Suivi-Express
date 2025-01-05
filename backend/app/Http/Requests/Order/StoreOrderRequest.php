<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'deleveryCompany' => ['required', 'integer', 'exists:delivery_companies,id'], // Must be an existing delivery company ID
            'tracking' => ['required', 'string', 'unique:orders,tracking'], // Unique tracking string
            'external_id' => ['nullable', 'string', 'max:255'], // Nullable and max 255 characters
            'client_name' => ['required', 'string', 'min:3'], // At least 3 characters
            'client_lastname' => ['nullable', 'string', 'min:3'], // Nullable but at least 3 characters if provided
            'phone' => [
                'required',
                'string',
                'max:50',
                'regex:/^[\d\s+-]+$/', // Allows digits, spaces, '+' and '-'
            ],
            'affected_to' => ['required', 'integer', 'exists:agents,id'], // Must be an existing agent ID
            'product_url' => ['nullable', 'string', 'min:3'], // Nullable but at least 3 characters if provided
        ];
    }
}
