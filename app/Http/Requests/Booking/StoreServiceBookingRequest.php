<?php

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceBookingRequest extends FormRequest
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
            'title' => 'required|string|max:255',
            'service_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'comment' => 'nullable|string',
            'contact_name' => 'required|string|max:255',
            'contact_number' => 'required|string|max:255',
            'contact_email' => 'required|string|max:255',
            'date' => 'required|date',
            'return_date' => 'nullable|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'total_amount' => 'required|numeric',
            'paid_amount' => 'required|numeric',
        ];
    }
}
