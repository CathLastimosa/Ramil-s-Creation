<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class StoreCustomerRequest extends FormRequest
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
            'username' => 'required|string|unique:customers_account,username',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:customers_account,email',
            'password' => 'required|min:8',
            'valid_id' => 'nullable|file|mimes:jpg,jpeg,png,gif,svg|max:2048',
            'avatar' => 'nullable|file|mimes:jpg,jpeg,png,gif|max:2048',
        ];
    }
    public function messages(): array
    {
        return [
            'username.required' => 'Please enter a username.',
            'email.unique' => 'This email is already registered.',
            'password.min' => 'Password must be at least 8 characters.',
        ];
    }
}
