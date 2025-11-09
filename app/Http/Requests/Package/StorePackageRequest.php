<?php

namespace App\Http\Requests\Package;

use Illuminate\Foundation\Http\FormRequest;

class StorePackageRequest extends FormRequest
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
            'packageName'        => 'required|string|max:255',
            'packageDescription' => 'nullable|string|max:255',
            'packageStatus'      => 'required|string|in:published,unpublished',
            'packagePrice'       => 'required|numeric|min:0',
            'packagePromo'       => 'nullable|numeric|max:100',
            'discountedPrice'    => 'required|numeric|min:0',
            'announceEmail'    => 'nullable|boolean',
        ];
    }
}
