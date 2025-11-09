<?php

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBookingRequest extends FormRequest
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
             'package_id' => 'required|exists:packages,package_id',
            'selected_services' => 'required|array',
            'selected_services.*' => 'exists:services,services_id',
            'datetime' => 'required',
            'eventName' => 'required',
            'guestCount' => 'required|integer',
            'street' => 'required',
            'city' => 'required',
            'barangay' => 'required',
            'province' => 'required',
            'specialRequests' => 'nullable',
            'fullName' => 'required',
            'email' => 'required|email',
            'phone' => 'required',
            'payment_method' => 'required',
            'reference_no' => 'nullable|string',
            'payment_proof' => 'nullable|image',
        ];
    }
}
