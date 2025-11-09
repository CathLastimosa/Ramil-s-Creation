<?php

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;

class BookingRequest extends FormRequest
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
            'eventName' => 'required|string|max:255',
            'guestCount' => 'required|integer|min:1',
            'street' => 'required|string|min:1',
            'city' => 'required|string|min:1',
            'barangay' => 'required|string|min:1',
            'province' => 'required|string|min:1',
            'fullName' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'phone' => 'required|string|max:15',
            'specialRequests' => 'nullable|string|max:255',
            'package_id' => 'required|string',
            'selected_services' => 'required|array',
            'payment_method' => 'required|string',
            // 'captcha_token'=> 'required|string',
        ];
    }
}
