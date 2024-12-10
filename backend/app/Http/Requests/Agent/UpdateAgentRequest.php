<?php

namespace App\Http\Requests\Agent;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAgentRequest extends FormRequest
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
        $agent = $this->route('agent'); // Get the agent ID from the route

        return [
            'name' => 'required|string|min:2|max:30',
            'email' => 'required|string|email|max:255|unique:agents,email,' . $agent->id,
        ];
    }
}
