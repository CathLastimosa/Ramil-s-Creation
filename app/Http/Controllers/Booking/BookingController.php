<?php

namespace App\Http\Controllers\Booking;

use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\StoreBookingRequest;
use App\Models\AssignedStaff;
use App\Models\Bookings;
use App\Models\BookingSelectedServices;
use App\Models\Package;
use App\Models\Payments;
use App\Models\Staff;
use App\Models\StaffAvailability;
use App\Notifications\VerifyBookingEmail;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Notifications\AssignedStaffBooking;
use Illuminate\Support\Facades\Notification;

class BookingController extends Controller
{

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBookingRequest $request)
    {
        /** @var \Illuminate\Http\Request $request */
        $validated = $request->validated();

        [$event_date, $slot] = explode(' ', $validated['datetime']);
        [$event_time_from, $event_time_to] = explode('-', $slot);

        $datePart = now()->format('Ymd');

        $lastBooking = Bookings::whereDate('created_at', now()->toDateString())
            ->orderBy('booking_id', 'desc')
            ->first();

        $sequence = $lastBooking
            ? intval(substr($lastBooking->transaction_number, -4)) + 1
            : 1;

        $sequencePadded = str_pad($sequence, 4, '0', STR_PAD_LEFT);
        $transactionNumber = 'RAMILS-' . $datePart . '-' . $sequencePadded;

        $package = Package::find($validated['package_id']);
        $totalAmount = $package->discounted_price;

        $booking = Bookings::create([
            'event_date' => $event_date,
            'event_time_from' => $event_time_from,
            'event_time_to' => $event_time_to,
            'event_type' => $package->package_name,
            'status' => 'pending',
            'event_name' => $validated['eventName'],
            'guest_count' => $validated['guestCount'],
            'barangay' => $validated['barangay'],
            'special_request' => $validated['specialRequests'],
            'street_address' => $validated['street'],
            'city' => $validated['city'],
            'province' => $validated['province'],
            'contact_name' => $validated['fullName'],
            'contact_email' => $validated['email'],
            'contact_number' => $validated['phone'],
            'total_amount' => $totalAmount,
        ]);

        $datePart = now()->format('Ymd');
        $transactionNumber = 'RAMILS-' . $datePart . '-' . str_pad($booking->booking_id, 4, '0', STR_PAD_LEFT);
        $booking->update(['transaction_number' => $transactionNumber]);

        foreach ($validated['selected_services'] as $services_id) {
            BookingSelectedServices::create([
                'package_id' => $validated['package_id'],
                'services_id' => $services_id,
                'booking_id' => $booking->booking_id,
            ]);
        }

        $payment_method = $validated['payment_method'] === '1' ? 'cash on hand' : 'gcash';

        $payment_proof_path = null;
        $reference_no = null;
        if ($payment_method === 'gcash') {
            if ($request->hasFile('payment_proof')) {
                $payment_proof_path = $request->file('payment_proof')->store('payments', 'public');
            }
            $reference_no = $validated['reference_no'] ?? null;
        }

        Payments::create([
            'booking_id' => $booking->booking_id,
            'payment_method' => $payment_method,
            'payment_proof' => $payment_proof_path,
            'reference_No' => $reference_no,
        ]);

        $booking->notify(new VerifyBookingEmail($booking));

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

        return redirect('/booking/PKG-001/services')->with('success', [
            'message' => 'Booking Submitted!',
            'booking' => [
                'booking_id' => $booking->booking_id,
                'contact_email' => $booking->contact_email,
                'transaction_number' => $booking->transaction_number ?? 'N/A',
            ],
        ]);
    }

    public function trackPage()
    {
        $promo = Package::orderBy('package_promo', 'desc')->where('status', 'published')->first();
        $packages = Package::get()->where('status', 'published');

        return Inertia::render('homepage/TrackBooking', [
            'promo' => $promo,
            'packages' => $packages,

        ]);
    }

    public function trackLookup(Request $request)
    {
        $request->validate([
            'transaction_number' => 'required|string|max:255',
        ]);

        $booking = Bookings::where('transaction_number', $request->transaction_number)->first();

        if (! $booking) {
            return redirect()->back()->with([
                'error' => 'Booking not found with this transaction number.',
            ]);
        }

        $booking->payments = Payments::where('booking_id', $booking->booking_id)->get();
        $booking->booking_selected_services = BookingSelectedServices::where('booking_id', $booking->booking_id)->with('service')->get();
        $booking->package = Package::where('package_name', $booking->event_type)->first();

        return Inertia::render('homepage/TrackBooking', [
            'booking' => $booking,
        ]);
    }
}
