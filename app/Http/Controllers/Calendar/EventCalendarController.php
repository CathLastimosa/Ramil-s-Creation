<?php

namespace App\Http\Controllers\Calendar;

use App\Http\Controllers\Controller;
use App\Models\Appointments;
use App\Models\BlockedDate;
use App\Models\Bookings;
use App\Models\Package;
use App\Models\ServiceBooking;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventCalendarController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $bookings = Bookings::whereIn('status', ['confirmed', 'pending', 'completed', 'cancelled'])
            ->whereNull('deleted_at')
            ->select('booking_id', 'transaction_number', 'event_name', 'event_date', 'event_time_from', 'event_time_to', 'status', 'guest_count', 'special_request', 'created_at', 'contact_name', 'contact_number', 'contact_email', 'street_address', 'city', 'province')
            ->get()
            ->groupBy('event_date');

        // Format bookings
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

        $appointments = Appointments::whereIn('status', ['reserved', 'completed'])
            ->select('appointment_id', 'contact_name', 'contact_email', 'contact_phone', 'purpose', 'appointment_date', 'appointment_time_from', 'appointment_time_to', 'status', 'created_at')
            ->get()
            ->groupBy('appointment_date');

        $blockedDates = BlockedDate::select('date_id', 'date', 'start_time', 'end_time', 'reason')
            ->get()
            ->groupBy(function ($item) {
                return Carbon::parse($item->date)->format('Y-m-d');
            });

        // Format block dates
        $blockedtimes = [];
        foreach ($blockedDates as $items) {
            foreach ($items as $row) {
                $date = Carbon::parse($row->date)->format('Y-m-d');
                $blockedtimes[$date][] = [
                    'from' => Carbon::parse($row->start_time)->format('H:i'),
                    'to' => Carbon::parse($row->end_time)->format('H:i'),
                ];
            }
        }
        $serviceBookings = ServiceBooking::whereIn('status', ['confirmed', 'completed', 'cancelled'])
            ->select('service_booking_id', 'title', 'service_name', 'description', 'comment', 'date', 'return_date', 'start_time', 'end_time', 'total_amount', 'paid_amount', 'status', 'created_at')
            ->get()
            ->groupBy(function ($item) {
                return Carbon::parse($item->date)->format('Y-m-d');
            });

        $appointmentTimes = [];
        foreach ($appointments as $items) {
            foreach ($items as $row) {
                $date = Carbon::parse($row->appointment_date)->format('Y-m-d');
                $appointmentTimes[$date][] = [
                    'from' => $row->appointment_time_from,
                    'to' => $row->appointment_time_to,
                    'status' => $row->status,
                ];
            }
        }

        // Format block dates
        $servicebookingtimes = [];
        foreach ($serviceBookings as $items) {
            foreach ($items as $row) {
                $date = Carbon::parse($row->date)->format('Y-m-d');
                $servicebookingtimes[$date][] = [
                    'from' => Carbon::parse($row->start_time)->format('H:i'),
                    'to' => Carbon::parse($row->end_time)->format('H:i'),
                    'status' => $row->status,
                ];
            }
        }

        return Inertia::render('comp-542', [
            'bookingEvents' => $bookings,
            'appointmentEvents' => $appointments,
            'blockedDates' => $blockedDates,
            'serviceBookings' => $serviceBookings,
            'servicebookingtimes' => $servicebookingtimes,
            'blockedtimes' => $blockedtimes,
            'bookedTimes' => $bookedTimes,
            'appointmentTimes' => $appointmentTimes,
        ]);
    }
}
