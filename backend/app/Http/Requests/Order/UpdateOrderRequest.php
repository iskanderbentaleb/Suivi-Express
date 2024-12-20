<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderRequest extends FormRequest
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
        // Assuming you have the order ID passed as a route parameter, e.g., /orders/{order}
        $orderId = $this->route('order'); // Adjust this to match your route parameter name

        return [
            'deleveryCompany' => ['required','integer','exists:delivery_companies,id',], // Must be an existing delivery company ID
            'tracking' => ['required','string',Rule::unique('orders', 'tracking')->ignore($orderId)], // Unique tracking string, excluding current order
            'external_id' => ['required','string',Rule::unique('orders', 'external_id')->ignore($orderId)], // Unique external ID, excluding current order
            'client_name' => ['required','string','min:3'], // At least 3 characters
            'client_lastname' => ['nullable','string','min:3'], // Nullable but at least 3 characters if provided
            'phone' => ['required','string','max:50','regex:/^[\d\s+-]+$/'], // Allows digits, spaces, '+' and '-'],
            'affected_to' => ['required','integer','exists:agents,id'] // Must be an existing agent ID
        ];
    }
}
