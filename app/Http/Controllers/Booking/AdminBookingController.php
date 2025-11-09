<?php

namespace App\Http\Controllers\Booking;

use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\AddBookingRequest;
use App\Models\Bookings;
use App\Models\Package;
use App\Models\Payments;
use App\Notifications\BookingStatusNotification;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\AssignedStaff;
use App\Models\BlockedDate;
use App\Models\BookingSelectedServices;
use App\Models\ServiceBooking;
use App\Models\Services;
use App\Models\Staff;
use App\Models\StaffAvailability;
use App\Notifications\AssignedStaffBooking;
use Illuminate\Support\Facades\Notification;
use App\Models\EmailNotification;
use \Illuminate\Support\Facades\Log;
use App\Jobs\SendBookingStatusNotification;
use App\Jobs\SendBookingSuccessfulNotification;
use App\Jobs\SendBookingCompletedNotification;

class AdminBookingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Bookings::with(['services', 'packages', 'payment'])->latest();
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('event_name', 'like', "%{$search}%")
                    ->orWhere('booking_id', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%")
                    ->orWhere('special_request', 'like', "%{$search}%")
                    ->orWhere('guest_count', 'like', "%{$search}%")
                    ->orWhere('contact_number', 'like', "%{$search}%")
                    ->orWhere('contact_email', 'like', "%{$search}%")
                    ->orWhere('street_address', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('province', 'like', "%{$search}%")
                    ->orWhere('contact_name', 'like', "%{$search}%")
                    ->orWhere('transaction_number', 'like', "%{$search}%");
            });
        }

        $bookings = $query->get();

        return Inertia::render('ManageBooking', [
            'bookings' => $bookings,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create($packageId)
    {
        $packages = Package::where('status', 'published')->get();
        $package = Package::with('services')->findOrFail($packageId);

        $bookings = Bookings::whereIn('status', ['confirmed', 'pending'])
            ->select('booking_id', 'event_date', 'event_time_from', 'event_time_to', 'status')
            ->get()
            ->groupBy('event_date');

        $bookedTimes = [];
        foreach ($bookings as $items) {
            foreach ($items as $row) {
                $date = Carbon::parse($row->event_date)->format('Y-m-d');
                $bookedTimes[$date][] = [
                    'from' => Carbon::parse($row->event_time_from)->format('H:i'),
                    'to' => Carbon::parse($row->event_time_to)->format('H:i'),
                    'status' => $row->status,
                ];
            }
        }

        $blockdates = BlockedDate::select('date_id', 'date', 'start_time', 'end_time')
            ->get()
            ->groupBy('date');

        $blockedtimes = [];
        foreach ($blockdates as $items) {
            foreach ($items as $row) {
                $date = Carbon::parse($row->date)->format('Y-m-d');
                $blockedtimes[$date][] = [
                    'from' => Carbon::parse($row->start_time)->format('H:i'),
                    'to' => Carbon::parse($row->end_time)->format('H:i'),
                ];
            }
        }

        $servicebooking = ServiceBooking::where('status', 'confirmed')
            ->select('service_booking_id', 'date', 'start_time', 'end_time', 'status')
            ->get()
            ->groupBy('date');

        $servicebookingtimes = [];
        foreach ($servicebooking as $items) {
            foreach ($items as $row) {
                $date = Carbon::parse($row->date)->format('Y-m-d');
                $servicebookingtimes[$date][] = [
                    'from' => Carbon::parse($row->start_time)->format('H:i'),
                    'to' => Carbon::parse($row->end_time)->format('H:i'),
                    'status' => $row->status,
                ];
            }
        }

        return Inertia::render('Booking/add-new-booking', [
            'packages' => $packages,
            'bookedTimes' => $bookedTimes,
            'blockedtimes' => $blockedtimes,
            'servicebookingtimes' => $servicebookingtimes,
            'relatedServices' => $package->services,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(AddBookingRequest $request)
    {
        $validated = $request->validated();

        // Parse datetime and slot times
        [$event_date, $slot] = explode(' ', $validated['datetime']);
        [$event_time_from, $event_time_to] = explode('-', $slot);

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

        // Fetch package to calculate total amount
        $package = Package::find($validated['package_id']);
        $totalAmount = $package->discounted_price;

        // Create booking
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

        SendBookingSuccessfulNotification::dispatch($booking, $notification->id);

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
        return redirect()->route('adminbooking.index')->with('success', 'Booking created successfully');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $bookingId)
    {
        $booking = Bookings::with(['services', 'packages', 'payment'])->findOrFail($bookingId);
        $packages = Package::all();

        $bookings = Bookings::whereIn('status', ['confirmed', 'pending'])
            ->where('booking_id', '!=', $bookingId)
            ->select('booking_id', 'event_date', 'event_time_from', 'event_time_to', 'status')
            ->get()
            ->groupBy('event_date');

        // Format bookedTimes
        $bookedTimes = [];
        foreach ($bookings as $items) {
            foreach ($items as $row) {
                $date = Carbon::parse($row->event_date)->format('Y-m-d');
                $bookedTimes[$date][] = [
                    'from' => $row->event_time_from,
                    'to' => $row->event_time_to,
                    'status' => $row->status,
                ];
            }
        }

        $blockedDates = BlockedDate::select('date', 'start_time', 'end_time')
            ->get()
            ->groupBy('date');

        //format blocked times
        $blockedtimes = [];
        foreach ($blockedDates as $date => $items) {
            foreach ($items as $row) {
                $blockedtimes[$date][] = [
                    'from' => $row->start_time,
                    'to' => $row->end_time,
                ];
            }
        }

        $serviceBookings = ServiceBooking::whereIn('status', ['confirmed', 'pending'])
            ->select('date', 'start_time', 'end_time')
            ->get()
            ->groupBy('date');

        //format service booking times
        $servicebookingtimes = [];
        foreach ($serviceBookings as $date => $items) {
            foreach ($items as $row) {
                $servicebookingtimes[$date][] = [
                    'from' => $row->start_time,
                    'to' => $row->end_time,
                ];
            }
        }

        return Inertia::render('EditEvent/booking', [
            'booking' => $booking,
            'packages' => $packages,
            'bookedTimes' => $bookedTimes,
            'blockedtimes' => $blockedtimes,
            'servicebookingtimes' => $servicebookingtimes,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'event_name' => 'required|string|max:255',
            'event_date' => 'required|date',
            'event_time_from' => 'required',
            'event_time_to' => 'required',
            'guest_count' => 'required|integer|min:1',
            'contact_name' => 'required|string|max:255',
            'contact_email' => 'required|email|max:255',
            'contact_number' => 'required|string|max:20',
            'street_address' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'province' => 'required|string|max:255',
            'special_request' => 'nullable|string',
        ]);

        $booking = Bookings::findOrFail($id);
        $booking->update($request->only([
            'event_name',
            'event_date',
            'event_time_from',
            'event_time_to',
            'guest_count',
            'contact_name',
            'contact_email',
            'contact_number',
            'street_address',
            'city',
            'province',
            'special_request',
        ]));

        // Remove existing assigned staff for this booking
        AssignedStaff::where('booking_id', $booking->booking_id)
            ->where('booking_type', 'event')
            ->delete();

        // Reassign available staff based on updated date and time
        $dayOfWeek = Carbon::parse($request->event_date)->format('l');
        $availabilities = StaffAvailability::where('day_of_week', $dayOfWeek)
            ->where('status', 'available')
            ->get();

        $availableStaffIds = [];
        if ($availabilities->isNotEmpty()) {
            $bookingStart = Carbon::parse($request->event_time_from);
            $bookingEnd = Carbon::parse($request->event_time_to);
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
            }
        }

        return redirect()->route('adminbooking.index')->with('success', 'Booking updated successfully');
    }

    public function editServices(string $bookingId)
    {
        $booking = Bookings::with(['services', 'packages'])->findOrFail($bookingId);
        $allServices = Services::all();
        $packages = Package::all();

        return Inertia::render('EditEvent/services', [
            'booking' => $booking,
            'allServices' => $allServices,
            'packages' => $packages,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */

    public function updateServices(Request $request, $id)
    {
        try {
            $request->validate([
                'selected_services' => 'array',
                'selected_services.*' => 'string|exists:services,services_id',
            ]);

            $booking = Bookings::with(['packages'])->findOrFail($id);

            $existingService = BookingSelectedServices::where('booking_id', $id)->first();
            $package_id = $existingService ? $existingService->package_id : ($booking->packages->first()->package_id ?? null);

            BookingSelectedServices::where('booking_id', $id)->delete();

            if (!empty($request->selected_services)) {
                foreach ($request->selected_services as $serviceId) {
                    BookingSelectedServices::create([
                        'booking_id' => $id,
                        'services_id' => $serviceId,
                        'package_id' => $package_id,
                    ]);
                }
            }

            return redirect()->route('adminbooking.index')->with('success', 'Services updated successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update services: ' . $e->getMessage());
        }
    }

    public function confirm(string $id)
    {
        $booking = Bookings::findOrFail($id);
        $booking->status = 'confirmed';
        $booking->save();

        if (!is_null($booking->email_verified_at) && $booking->email_verified == true) {
            $notification = EmailNotification::create([
                'subject' => 'Booking Confirmation',
                'recipient_type' => 'customer',
                'recipient_id' => $booking->booking_id,
                'recipient_email' => $booking->contact_email,
                'type' => 'confirmation',
                'status' => 'pending',
            ]);

            SendBookingStatusNotification::dispatch(
                $booking,
                'Your booking has been confirmed successfully.',
                $notification->id
            );
        }

        return redirect()->back()->with('success', 'Booking has been confirmed successfully.');
    }

    public function decline(Request $request, string $id)
    {
        $request->validate([
            'decline_reason' => 'required|string|max:1000',
        ]);

        $booking = Bookings::findOrFail($id);

        $booking->status = 'cancelled';
        $booking->decline_reason = $request->decline_reason;
        $booking->save();

        if (!is_null($booking->email_verified_at) && $booking->email_verified == true) {
            $booking->notify(new BookingStatusNotification(
                $booking,
                'We regret to inform you that your booking was declined. Reason: ' . $booking->decline_reason
            ));
        }

        return redirect()->back()->with('success', 'Booking has been declined successfully.');
    }


    public function complete(string $id)
    {
        $booking = Bookings::findOrFail($id);

        $booking->status = 'completed';
        $booking->save();

        if (!is_null($booking->email_verified_at) && $booking->email_verified == true) {
            $notification = EmailNotification::create([
                'subject' => 'Booking Completed',
                'recipient_type' => 'customer',
                'recipient_id' => $booking->booking_id,
                'recipient_email' => $booking->contact_email,
                'type' => 'confirmation',
                'status' => 'pending',
            ]);

            SendBookingCompletedNotification::dispatch($booking, $notification->id);
        }

        return redirect()->back()->with('success', 'Booking has been marked as completed.');
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $bookingId): RedirectResponse
    {
        $booking = Bookings::findOrFail($bookingId);
        if ($booking->status === 'completed') {
            $booking->delete(); // soft delete
        } else {
            $booking->forceDelete(); // permanent delete
        }

        return redirect()->route('adminbooking.index')->with('success', 'Booking deleted successfully.');
    }

    public function updatePayment(Request $request, $booking_id)
    {
        $request->validate([
            'amount' => ['required', 'numeric', 'min:0'],
        ]);

        $booking = Bookings::where('booking_id', $booking_id)->firstOrFail();

        $payment = $booking->payment;

        // Update existing payment
        $payment->amount = $request->amount;
        $payment->save();
    }

    public function report(string $booking_id)
    {
        $booking = Bookings::with(['services', 'packages', 'payment'])->findOrFail($booking_id);

        $pdf = Pdf::loadView('pdfs.customer_booking_report', compact('booking'))
            ->setPaper('a4', 'portrait');

        return $pdf->stream("customer_booking_report_{$booking->booking_id}.pdf");
    }

    public function verifyEmail(string $bookingId)
    {
        $booking = Bookings::findOrFail($bookingId);
        $booking->email_verified = true;
        $booking->email_verified_at = now();
        $booking->save();

        return redirect()->back()->with('success', 'Email has been verified successfully.');
    }
}
