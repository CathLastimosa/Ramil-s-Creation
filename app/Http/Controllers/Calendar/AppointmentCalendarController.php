<?php

namespace App\Http\Controllers\Calendar;

use App\Http\Controllers\Controller;
use App\Models\Appointments;
use Illuminate\Http\Request;
use App\Models\EmailNotification;
use App\Jobs\SendAppointmentNotification;

class AppointmentCalendarController extends Controller
{
    /**
     * Store a new appointment via calendar.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'contact_name' => 'required|string|max:255',
            'contact_email' => 'required|email|max:255',
            'contact_phone' => 'required|string|max:255',
            'purpose' => 'nullable|string|max:255',
            'appointment_date' => 'required|date',
            'appointment_time_from' => 'required|date_format:H:i',
            'appointment_time_to' => 'nullable|date_format:H:i',
            'status' => 'required|string|in:pending,reserved,cancelled,completed',
        ]);

        $appointment = Appointments::create([
            'contact_name' => $data['contact_name'],
            'contact_email' => $data['contact_email'],
            'contact_phone' => $data['contact_phone'],
            'purpose' => $data['purpose'],
            'appointment_date' => $data['appointment_date'],
            'appointment_time_from' => $data['appointment_time_from'],
            'appointment_time_to' => $data['appointment_time_to'],
            'status' => $data['status'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $notification = EmailNotification::create([
            'subject' => 'Appoitment Submitted',
            'recipient_type' => 'customer',
            'recipient_id' => $appointment->appointment_id,
            'recipient_email' => $appointment->contact_email,
            'type' => 'submission',
            'status' => 'pending',
        ]);

        SendAppointmentNotification::dispatch($appointment, $notification->id);
    }

    /**
     * Update the appointment date and times via calendar drag-and-drop.
     */
    public function update(Request $request, int $id)
    {
        $data = $request->validate([
            'appointment_date' => 'required|date',
            'appointment_time_from' => 'required|date_format:H:i',
            'appointment_time_to' => 'nullable|date_format:H:i',
        ]);

        $appointment = Appointments::findOrFail($id);

        $appointment->update($data);

        return response()->json(['message' => 'Appointment updated successfully']);
    }

    /**
     * Delete an appointment via calendar.
     */
    public function destroy(int $id)
    {
        $appointment = Appointments::findOrFail($id);

        $appointment->delete();

        return response()->json(['message' => 'Appointment deleted successfully']);
    }
}
