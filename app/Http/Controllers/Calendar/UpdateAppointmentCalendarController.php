<?php

namespace App\Http\Controllers\Calendar;

use App\Http\Controllers\Controller;
use App\Models\Appointments;
use Illuminate\Http\Request;

class UpdateAppointmentCalendarController extends Controller
{
    /**
     * Update the appointment date and times via calendar drag-and-drop.
     */
    public function update(Request $request, string $id)
    {
        $data = $request->validate([
            'appointment_date' => 'required|date',
            'appointment_time_from' => 'nullable|date_format:H:i',
            'appointment_time_to' => 'nullable|date_format:H:i',
        ]);

        $appointment = Appointments::where('appointment_id', $id)->firstOrFail();

        $appointment->update($data);

        return response()->json(['message' => 'Appointment updated successfully']);
    }

    /**
     * Delete an appointment via calendar.
     */
    public function destroy(string $id)
    {
        $appointment = Appointments::where('appointment_id', $id)->firstOrFail();

        $appointment->delete();

        return response()->json(['message' => 'Appointment deleted successfully']);
    }
}
