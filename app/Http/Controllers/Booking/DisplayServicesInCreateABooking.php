<?php

namespace App\Http\Controllers\Booking;

use App\Http\Controllers\Controller;
use App\Models\Appointments;
use App\Models\BlockedDate;
use App\Models\Bookings;
use App\Models\ServiceBooking;
use App\Models\Package;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DisplayServicesInCreateABooking extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($packageId)
    {
        $packages = Package::where('status', 'published')->get();

        $package = Package::with('services')->findOrFail($packageId);

        $bookings = Bookings::whereIn('status', ['confirmed', 'pending'])
            ->select('booking_id', 'event_date', 'event_time_from', 'event_time_to', 'status')
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

        $blockdates = BlockedDate::select('date_id', 'date', 'start_time', 'end_time')
            ->get()
            ->groupBy('date');

        // Format block dates
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

        // Format block dates
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

        return Inertia::render('Booking', [
            'packages' => $packages,
            'bookedTimes' => $bookedTimes,
            'blockedtimes' => $blockedtimes,
            'servicebookingtimes' => $servicebookingtimes,
            'relatedServices' => $package->services,
        ]);

    }
}
