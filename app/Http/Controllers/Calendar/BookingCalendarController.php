<?php

namespace App\Http\Controllers\Calendar;

use App\Http\Controllers\Controller;
use App\Models\Bookings;
use App\Models\Package;
use App\Models\Payments;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\AssignedStaff;
use App\Models\BookingSelectedServices;
use App\Models\Staff;
use App\Models\StaffAvailability;
use App\Notifications\AssignedStaffBooking;
use Illuminate\Support\Facades\Notification;
use App\Models\EmailNotification;
use App\Jobs\SendBookingSuccessfulNotification;

class BookingCalendarController extends Controller
{
    /**
     * Update the booking date and times via calendar drag-and-drop.
     */
    public function update(Request $request, string $id)
    {
        $data = $request->validate([
            'event_date' => 'required|date',
            'event_time_from' => 'nullable|date_format:H:i',
            'event_time_to' => 'nullable|date_format:H:i',
        ]);

        $booking = Bookings::where('booking_id', $id)->firstOrFail();

        $booking->update($data);

        return response()->json(['message' => 'Booking updated successfully']);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'package_id' => 'required|exists:packages,package_id',
            'selected_services' => 'required|array',
            'selected_services.*' => 'exists:services,services_id',
            'event_name' => 'required|string|max:255',
            'event_date' => 'required|date',
            'event_time_from' => 'required|date_format:H:i',
            'event_time_to' => 'required|date_format:H:i',
            'guest_count' => 'required|integer|min:1',
            'special_request' => 'nullable|string',
            'contact_name' => 'required|string|max:255',
            'contact_email' => 'required|email|max:255',
            'contact_number' => 'required|string|max:20',
            'street_address' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'province' => 'required|string|max:255',
            'total_amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:1,2',
        ]);

        $event_date = $validated['event_date'];
        $event_time_from = $validated['event_time_from'];
        $event_time_to = $validated['event_time_to'];

        // Generate transaction number
        $datePart = now()->format('Ymd');

        // Get last transaction for today
        $lastBooking = Bookings::whereDate('created_at', now()->toDateString())
            ->orderBy('booking_id', 'desc')
            ->first();

        $sequence = $lastBooking
            ? intval(substr($lastBooking->transaction_number, -4)) + 1
            : 1;

        $sequencePadded = str_pad($sequence, 4, '0', STR_PAD_LEFT);
        $transactionNumber = 'RAMILS-' . $datePart . '-' . $sequencePadded;

        $package = Package::find($validated['package_id']);

        $booking = Bookings::create([
            'event_date' => $event_date,
            'event_time_from' => $event_time_from,
            'event_time_to' => $event_time_to,
            'event_type' => $package->package_name,
            'status' => 'pending',
            'event_name' => $validated['event_name'],
            'guest_count' => $validated['guest_count'],
            'special_request' => $validated['special_request'],
            'street_address' => $validated['street_address'],
            'city' => $validated['city'],
            'province' => $validated['province'],
            'contact_name' => $validated['contact_name'],
            'contact_email' => $validated['contact_email'],
            'contact_number' => $validated['contact_number'],
            'total_amount' => $validated['total_amount'],
        ]);

        $datePart = now()->format('Ymd');
        $transactionNumber = 'RAMILS-' . $datePart . '-' . str_pad($booking->booking_id, 4, '0', STR_PAD_LEFT);
        $booking->update(['transaction_number' => $transactionNumber]);

        // Save selected services
        foreach ($validated['selected_services'] as $services_id) {
            BookingSelectedServices::create([
                'package_id' => $validated['package_id'],
                'services_id' => $services_id,
                'booking_id' => $booking->booking_id,
            ]);
        }

        $payment_method = $validated['payment_method'] === '1' ? 'cash on hand' : 'gcash';
        Payments::create([
            'booking_id' => $booking->booking_id,
            'payment_method' => $payment_method,
            'amount' => $validated['total_amount'],
        ]);

        $notification = EmailNotification::create([
            'subject' => 'Booking Submitted',
            'recipient_type' => 'customer',
            'recipient_id' => $booking->booking_id,
            'recipient_email' => $booking->contact_email,
            'type' => 'submission',
            'status' => 'pending',
        ]);

        // SendBookingSuccessfulNotification::dispatch($booking, $notification->id);

        // Automatically assign available staff based on staff_availability for the day
        $dayOfWeek = Carbon::parse($event_date)->format('l');
        $availabilities = StaffAvailability::where('day_of_week', $dayOfWeek)
            ->where('status', 'available')
            ->get();

        $availableStaffIds = [];
        if ($availabilities->isNotEmpty()) {
            $bookingStart = Carbon::parse($event_time_from);
            $bookingEnd = Carbon::parse($event_time_to);
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
                    'booking_id' => $booking->booking_id,
                    'service_booking_id' => null,
                    'staff_id' => $staffId,
                    'assigned_role' => $staff->role,
                    'booking_type' => 'event',
                ]);

                // staff to notify
                $assignedStaff[] = $staff;
            }
        }
        // Notify all assigned staff
        if (!empty($assignedStaff)) {
            Notification::send($assignedStaff, new AssignedStaffBooking($booking));
        }
    }

    /**
     * Delete a booking via calendar.
     */
    public function destroy(string $id)
    {
        $booking = Bookings::where('booking_id', $id)->firstOrFail();

        $booking->delete();

        return response()->json(['message' => 'Booking deleted successfully']);
    }

    public function packages()
    {
        $packages = Package::where('status', 'published')->get();
        return response()->json($packages);
    }

    public function packageServices($id)
    {
        $package = Package::with('services')->findOrFail($id);
        return response()->json($package->services);
    }
}
