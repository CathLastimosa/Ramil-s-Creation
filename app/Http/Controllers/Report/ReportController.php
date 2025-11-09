<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Models\Appointments;
use App\Models\Bookings;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Bookings::withTrashed()->where('status', 'completed');

        // Apply filters
        if ($request->has('date') && $request->date) {
            $query->whereDate('event_date', $request->date);
        }
        if ($request->has('month') && $request->month) {
            $query->whereMonth('event_date', $request->month);
        }
        if ($request->has('year') && $request->year) {
            $query->whereYear('event_date', $request->year);
        }
        if ($request->has('package_name') && $request->package_name) {
            $query->where('event_type', 'like', '%'.$request->package_name.'%');
        }

        if ($request->has('search') && $request->search != null) {
            $query->where(function ($q) use ($request) {
                $q->where('booking_id', 'like', '%'.$request->search.'%')
                    ->orWhere('transaction_number', 'like', '%'.$request->search.'%')
                    ->orWhere('event_name', 'like', '%'.$request->search.'%')
                    ->orWhere('event_time_from', 'like', '%'.$request->search.'%')
                    ->orWhere('event_time_to', 'like', '%'.$request->search.'%')
                    ->orWhere('event_type', 'like', '%'.$request->search.'%')
                    ->orWhere('guest_count', 'like', '%'.$request->search.'%')
                    ->orWhere('special_request', 'like', '%'.$request->search.'%')
                    ->orWhere('contact_name', 'like', '%'.$request->search.'%')
                    ->orWhere('contact_number', 'like', '%'.$request->search.'%')
                    ->orWhere('contact_email', 'like', '%'.$request->search.'%')
                    ->orWhere('street_address', 'like', '%'.$request->search.'%')
                    ->orWhere('city', 'like', '%'.$request->search.'%')
                    ->orWhere('province', 'like', '%'.$request->search.'%');
            });
        }

        $booking = $query->get();

        $query = Appointments::withTrashed()->where('status', 'completed');

        // Apply filters
        if ($request->has('date') && $request->date) {
            $query->whereDate('appointment_date', $request->date);
        }
        if ($request->has('month') && $request->month) {
            $query->whereMonth('appointment_date', $request->month);
        }
        if ($request->has('year') && $request->year) {
            $query->whereYear('appointment_date', $request->year);
        }

        // Appointments don't have package_name, so skip
        if ($request->has('search') && $request->search != null) {
            $query->where(function ($q) use ($request) {
                $q->where('appointment_id', 'like', '%'.$request->search.'%')
                    ->orWhere('contact_name', 'like', '%'.$request->search.'%')
                    ->orWhere('contact_email', 'like', '%'.$request->search.'%')
                    ->orWhere('contact_phone', 'like', '%'.$request->search.'%')
                    ->orWhere('purpose', 'like', '%'.$request->search.'%')
                    ->orWhere('appointment_date', 'like', '%'.$request->search.'%');
            });
        }

        $appointment = $query->get();

        $query = \App\Models\ServiceBooking::where('status', 'completed');

        // Apply filters
        if ($request->has('date') && $request->date) {
            $query->whereDate('date', $request->date);
        }
        if ($request->has('month') && $request->month) {
            $query->whereMonth('date', $request->month);
        }
        if ($request->has('year') && $request->year) {
            $query->whereYear('date', $request->year);
        }
        if ($request->has('package_name') && $request->package_name) {
            $query->where('service_name', 'like', '%'.$request->package_name.'%');
        }

        if ($request->has('search') && $request->search != null) {
            $query->where(function ($q) use ($request) {
                $q->where('service_booking_id', 'like', '%'.$request->search.'%')
                    ->orWhere('title', 'like', '%'.$request->search.'%')
                    ->orWhere('service_name', 'like', '%'.$request->search.'%')
                    ->orWhere('description', 'like', '%'.$request->search.'%')
                    ->orWhere('comment', 'like', '%'.$request->search.'%')
                    ->orWhere('date', 'like', '%'.$request->search.'%');
            });
        }

        $service_booking = $query->get();

        return Inertia::render('Report/report', [
            'booking' => $booking,
            'appointment' => $appointment,
            'service_booking' => $service_booking,
        ]);

    }


    /**
     * Remove the specified resource from storage.
     */
    public function bookingDestroy(string $id)
    {
        $booking = Bookings::withTrashed()->findOrFail($id);
        $booking->forceDelete();

        return redirect()->back()->with('success', 'Booking permanently deleted.');
    }

    public function appointmentDestroy(string $id)
    {
        $appointment = Appointments::withTrashed()->findOrFail($id);
        $appointment->forceDelete();

        return redirect()->back()->with('success', 'Appointment permanently deleted.');
    }

    public function serviceBookingDestroy(string $id)
    {
        $serviceBooking = \App\Models\ServiceBooking::findOrFail($id);
        $serviceBooking->delete();

        return redirect()->back()->with('success', 'Service booking deleted.');
    }
}
