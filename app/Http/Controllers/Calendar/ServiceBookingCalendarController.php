<?php

namespace App\Http\Controllers\Calendar;

use App\Http\Controllers\Controller;
use App\Models\ServiceBooking;
use Illuminate\Http\Request;
use App\Models\AssignedStaff;
use App\Models\Staff;
use App\Models\StaffAvailability;
use App\Notifications\ServiceBookingSuccessfullNotification;
use Carbon\Carbon;
use App\Notifications\AssignedStaffServiceBooking;
use App\Http\Requests\Booking\StoreServiceBookingRequest;
use App\Models\EmailNotification;
use App\Jobs\SendServiceBookingNotification;

class ServiceBookingCalendarController extends Controller
{
    /**
     * Store a new service booking via calendar.
     */
    public function store(StoreServiceBookingRequest $request)
    {
        $validated = $request->validated();

        $serviceBooking = ServiceBooking::create($validated);

        // Automatically assign available staff based on staff_availability for the day
        $dayOfWeek = Carbon::parse($validated['date'])->format('l');
        $availabilities = StaffAvailability::where('day_of_week', $dayOfWeek)
            ->where('status', 'available')
            ->get();

        $availableStaffIds = [];
        if ($availabilities->isNotEmpty()) {
            $bookingStart = Carbon::parse($validated['start_time']);
            $bookingEnd = Carbon::parse($validated['end_time']);
            foreach ($availabilities as $availability) {
                $availStart = Carbon::parse($availability->start_time);
                $availEnd = Carbon::parse($availability->end_time);
                if ($availStart->lessThanOrEqualTo($bookingStart) && $availEnd->greaterThanOrEqualTo($bookingEnd)) {
                    $availableStaffIds[] = $availability->staff_id;
                }
            }
        }
        // Only assign staff who are available for the day; do not assign all staff if none are available
        $availableStaffIds = array_unique($availableStaffIds);

        foreach ($availableStaffIds as $staffId) {
            $staff = Staff::find($staffId);
            if ($staff) {
                AssignedStaff::create([
                    'booking_id' => null,
                    'service_booking_id' => $serviceBooking->getKey(),
                    'staff_id' => $staffId,
                    'assigned_role' => $staff->role,
                    'booking_type' => 'service',
                ]);

                // Send notification to each assigned staff
                $staff->notify(new AssignedStaffServiceBooking($serviceBooking));
            }
        }

        $notification = EmailNotification::create([
            'subject' => 'Service Booking Submitted',
            'recipient_type' => 'customer',
            'recipient_id' => $serviceBooking->appointment_id,
            'recipient_email' => $serviceBooking->contact_email,
            'type' => 'submission',
            'status' => 'pending',
        ]);

        SendServiceBookingNotification::dispatch($serviceBooking, $notification->id);
    }

    /**
     * Update the service booking date and times via calendar drag-and-drop.
     */
    public function update(Request $request, string $id)
    {
        $data = $request->validate([
            'date' => 'required|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
        ]);

        $serviceBooking = ServiceBooking::where('service_booking_id', $id)->firstOrFail();

        $serviceBooking->update($data);

        return response()->json(['message' => 'Service booking updated successfully']);
    }

    /**
     * Delete a service booking via calendar.
     */
    public function destroy(string $id)
    {
        $serviceBooking = ServiceBooking::where('service_booking_id', $id)->firstOrFail();

        $serviceBooking->delete();

        return response()->json(['message' => 'Service booking deleted successfully']);
    }
}
