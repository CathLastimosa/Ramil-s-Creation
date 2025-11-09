<?php

namespace App\Http\Controllers\Booking;

use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\StoreServiceBookingRequest;
use App\Models\AssignedStaff;
use App\Models\ServiceBooking;
use App\Models\Staff;
use App\Models\StaffAvailability;
use Carbon\Carbon;
use App\Models\Bookings;
use App\Models\BlockedDate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Notifications\AssignedStaffServiceBooking;
use App\Models\EmailNotification;
use App\Jobs\SendServiceBookingNotification;
use App\Jobs\SendServiceBookingCompletedNotification;

class ServiceBookingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = ServiceBooking::latest();
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('service_name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%")
                    ->orWhere('service_booking_id', 'like', "%{$search}%");
            });
        }

        $service_bookings = $query->get();

        return Inertia::render('ManageServiceBooking', [
            'service_bookings' => $service_bookings,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $bookings = Bookings::whereIn('status', ['confirmed', 'pending'])
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

        $servicebookingtimes = [];
        foreach ($serviceBookings as $date => $items) {
            foreach ($items as $row) {
                $servicebookingtimes[$date][] = [
                    'from' => $row->start_time,
                    'to' => $row->end_time,
                ];
            }
        }

        return Inertia::render('Booking/add-new-servicebooking', [
            'bookedTimes' => $bookedTimes,
            'blockedtimes' => $blockedtimes,
            'servicebookingtimes' => $servicebookingtimes,
        ]);
    }

    /**
     * Store a newly created resource in storage.
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
                $staff->notify(instance: new AssignedStaffServiceBooking($serviceBooking));
            }
        }
        $notification = EmailNotification::create([
            'subject' => 'Service Booking Submitted',
            'recipient_type' => 'customer',
            'recipient_id' => $serviceBooking->service_booking_id,
            'recipient_email' => $serviceBooking->contact_email,
            'type' => 'submission',
            'status' => 'pending',
        ]);

        SendServiceBookingNotification::dispatch($serviceBooking, $notification->id);


        return redirect()->route('service-bookings.index')->with('success', 'Service booking created successfully!');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $serviceBooking = ServiceBooking::with(['staff'])->where('service_booking_id', $id)->firstOrFail();

        $bookings = Bookings::whereIn('status', ['confirmed', 'pending'])
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

        $blockedtimes = [];
        foreach ($blockedDates as $date => $items) {
            foreach ($items as $row) {
                $blockedtimes[$date][] = [
                    'from' => $row->start_time,
                    'to' => $row->end_time,
                ];
            }
        }

        // Fetch service bookings excluding the current one
        $serviceBookings = ServiceBooking::whereIn('status', ['confirmed', 'pending'])
            ->where('service_booking_id', '!=', $id)
            ->select('date', 'start_time', 'end_time')
            ->get()
            ->groupBy('date');

        $servicebookingtimes = [];
        foreach ($serviceBookings as $date => $items) {
            foreach ($items as $row) {
                $servicebookingtimes[$date][] = [
                    'from' => $row->start_time,
                    'to' => $row->end_time,
                ];
            }
        }

        return Inertia::render('EditServiceBooking/service', [
            'serviceBooking' => $serviceBooking,
            'bookedTimes' => $bookedTimes,
            'blockedtimes' => $blockedtimes,
            'servicebookingtimes' => $servicebookingtimes,
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'service_name' => 'required|string|max:255',
            'description' => 'required|string',
            'comment' => 'nullable|string',
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'total_amount' => 'required|numeric|min:0',
            'paid_amount' => 'required|numeric|min:0',
        ]);

        $serviceBooking = ServiceBooking::where('service_booking_id', $id)->firstOrFail();
        $serviceBooking->update($validated);

        // Remove existing assigned staff for this service booking
        AssignedStaff::where('service_booking_id', $serviceBooking->service_booking_id)
            ->where('booking_type', 'service')
            ->delete();

        // Reassign available staff based on updated date and time
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
                    'service_booking_id' => $serviceBooking->service_booking_id,
                    'staff_id' => $staffId,
                    'assigned_role' => $staff->role,
                    'booking_type' => 'service',
                ]);
            }
        }

        return redirect()->route('service-bookings.index')->with('success', 'Service booking updated successfully!');
    }

    /**
     * Update the specified resource in storage.
     */
    public function updatePayment(Request $request, string $id)
    {
        $request->validate([
            'paid_amount' => 'required|numeric|min:0',
        ]);
        $serviceBooking = ServiceBooking::where('service_booking_id', $id)->firstOrFail();

        $serviceBooking->paid_amount = $request->paid_amount;
        $serviceBooking->save();

        return redirect()->back()->with('success', 'Service booking updated successfully.');
    }

    /**
     * Update service booking date/time via API (used by calendar drag/drop)
     */
    public function updateDateTime(Request $request, $id)
    {
        $data = $request->validate([
            'date' => 'required|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
        ]);

        $serviceBooking = ServiceBooking::where('service_booking_id', $id)->firstOrFail();

        $serviceBooking->date = $data['date'];
        $serviceBooking->start_time = $data['start_time'] ?? null;
        $serviceBooking->end_time = $data['end_time'] ?? null;
        $serviceBooking->save();

        return response()->json($serviceBooking);
    }

    public function complete(string $id)
    {
        $booking = ServiceBooking::findOrFail($id);
        $booking->status = 'completed';
        $booking->save();

        $notification = EmailNotification::create([
            'subject' => 'Service Booking Completed',
            'recipient_type' => 'customer',
            'recipient_id' => $booking->service_booking_id,
            'recipient_email' => $booking->contact_email,
            'type' => 'confirmation',
            'status' => 'pending',
        ]);

        SendServiceBookingCompletedNotification::dispatch($booking, $notification->id);

        return redirect()->back()->with('success', 'Service booking has been marked as completed.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $booking = ServiceBooking::findOrFail($id);
        if ($booking->status === 'completed') {
            $booking->delete();
        } else {
            $booking->forceDelete();
        }

        return redirect()->back()->with('success', 'Service booking deleted successfully.');
    }
}
