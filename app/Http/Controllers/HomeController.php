<?php

namespace App\Http\Controllers;

use App\Models\Appointments;
use App\Models\Bookings;
use App\Models\Feedbacks;
use App\Models\ServiceBooking;
use App\Models\Staff;
use Carbon\Carbon;
use Inertia\Inertia;
use App\Models\BlockedDate;
use App\Models\Package;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function home()
    {
        $feedbacks = Feedbacks::with('booking')->get();
        $packages = Package::get()->where('status', 'published');
        $promo = Package::orderBy('package_promo', 'desc')->where('status', 'published')->first();

        return Inertia::render('homepage/index', [
            'feedbacks' => $feedbacks,
            'packages' => $packages,
            'promo' => $promo,
        ]);
    }

    public function dashboard(Request $request)
    {
        $month = $request->input('month');
        $year = $request->input('year');

        $appointmentsQuery = Appointments::selectRaw('DATE(appointment_date) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date');

        $bookingsQuery = Bookings::selectRaw('DATE(event_date) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date');

        $serviceBookingsQuery = ServiceBooking::selectRaw('DATE(date) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date');

        if ($month && $year) {
            $appointmentsQuery->whereYear('appointment_date', $year)->whereMonth('appointment_date', $month);
            $bookingsQuery->whereYear('event_date', $year)->whereMonth('event_date', $month);
            $serviceBookingsQuery->whereYear('date', $year)->whereMonth('date', $month);
        } elseif ($year) {
            $appointmentsQuery->whereYear('appointment_date', $year);
            $bookingsQuery->whereYear('event_date', $year);
            $serviceBookingsQuery->whereYear('date', $year);
        } else {
            $appointmentsQuery->whereYear('appointment_date', now()->year);
            $bookingsQuery->whereYear('event_date', now()->year);
            $serviceBookingsQuery->whereYear('date', now()->year);
        }

        $data = $appointmentsQuery->get()->map(function ($item) {
            return ['date' => $item->date, 'value' => $item->count];
        });

        $bookingsData = $bookingsQuery->get()->map(function ($item) {
            return ['date' => $item->date, 'value' => $item->count];
        });

        $serviceBookingsData = $serviceBookingsQuery->get()->map(function ($item) {
            return ['date' => $item->date, 'value' => $item->count];
        });

        $startDate = $year ? Carbon::createFromDate($year, 1, 1)->startOfYear() : Carbon::now()->startOfYear();
        $endDate = $year ? Carbon::createFromDate($year, 12, 31)->endOfYear() : Carbon::now()->endOfYear();

        $appointmentsMonthly = Appointments::selectRaw('YEAR(appointment_date) as year, MONTH(appointment_date) as month, COUNT(*) as count')
            ->whereBetween('appointment_date', [$startDate, $endDate])
            ->groupBy('year', 'month')
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get();

        $bookingsMonthly = Bookings::selectRaw('YEAR(event_date) as year, MONTH(event_date) as month, COUNT(*) as count')
            ->whereBetween('event_date', [$startDate, $endDate])
            ->groupBy('year', 'month')
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get();

        $serviceBookingsMonthly = ServiceBooking::selectRaw('YEAR(date) as year, MONTH(date) as month, COUNT(*) as count')
            ->whereBetween('date', [$startDate, $endDate])
            ->groupBy('year', 'month')
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get();

        // Combine data
        $months = [];
        for ($date = $startDate; $date <= $endDate; $date->addMonth()) {
            $monthName = $date->format('M'); // Jan
            $monthNum = $date->month;
            $yearNum = $date->year;
            $months[] = [
                'month' => $monthName,
                'month_num' => $monthNum,
                'year' => $yearNum,
                'appointments' => 0,
                'bookings' => 0,
                'serviceBookings' => 0,
            ];
        }

        foreach ($months as &$monthData) {
            $monthData['appointments'] = $appointmentsMonthly->where('year', $monthData['year'])->where('month', $monthData['month_num'])->first()?->count ?? 0;
            $monthData['bookings'] = $bookingsMonthly->where('year', $monthData['year'])->where('month', $monthData['month_num'])->first()?->count ?? 0;
            $monthData['serviceBookings'] = $serviceBookingsMonthly->where('year', $monthData['year'])->where('month', $monthData['month_num'])->first()?->count ?? 0;
        }

        $monthlyData = $months;

        $bookingStatusesQuery = Bookings::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->whereIn('status', ['pending', 'confirmed', 'completed', 'cancelled']);

        $appointmentStatusesQuery = Appointments::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->whereIn('status', ['reserved', 'completed']);

        $serviceBookingStatusesQuery = ServiceBooking::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->whereIn('status', ['confirmed', 'completed', 'cancelled']);

        if ($month && $year) {
            $bookingStatusesQuery->whereYear('event_date', $year)->whereMonth('event_date', $month);
            $appointmentStatusesQuery->whereYear('appointment_date', $year)->whereMonth('appointment_date', $month);
            $serviceBookingStatusesQuery->whereYear('date', $year)->whereMonth('date', $month);
        } elseif ($year) {
            $bookingStatusesQuery->whereYear('event_date', $year);
            $appointmentStatusesQuery->whereYear('appointment_date', $year);
            $serviceBookingStatusesQuery->whereYear('date', $year);
        }

        $bookingStatuses = $bookingStatusesQuery->get()->map(function ($item) {
            return [
                'status' => $item->status,
                'count' => $item->count,
            ];
        });

        $appointmentStatuses = $appointmentStatusesQuery->get()->map(function ($item) {
            return [
                'status' => $item->status,
                'count' => $item->count,
            ];
        });

        $serviceBookingStatuses = $serviceBookingStatusesQuery->get()->map(function ($item) {
            return [
                'status' => $item->status,
                'count' => $item->count,
            ];
        });

        // Overall Shop Rating
        $feedbacks = Feedbacks::with('booking')->get();
        $averageRating = $feedbacks->avg('rating_emote') ?? 0;
        $contactNames = $feedbacks->pluck('booking.contact_name')->values();

        // Upcoming Appointments
        $upcomingAppointments = Appointments::where('appointment_date', '>=', now())
            ->where('status', 'reserved')
            ->orderBy('appointment_date')
            ->orderBy('appointment_time_from')
            ->take(5)
            ->get();

        // Upcoming Events
        $upcomingEvents = Bookings::where('event_date', '>=', now())
            ->where('status', 'confirmed')
            ->orderBy('event_date')
            ->orderBy('event_time_from')
            ->take(5)
            ->get();

        // Staff Availability for today
        $today = now()->format('l'); // e.g., 'Sunday'
        $staffAvailability = Staff::with(['availability' => function ($query) use ($today) {
            $query->where('day_of_week', $today);
        }])->get();

        return Inertia::render('dashboard', [
            'appointmentsData' => $data,
            'bookingsData' => $bookingsData,
            'serviceBookingsData' => $serviceBookingsData,
            'monthlyData' => $monthlyData,
            'bookingStatuses' => $bookingStatuses,
            'appointmentStatuses' => $appointmentStatuses,
            'serviceBookingStatuses' => $serviceBookingStatuses,
            'averageRating' => $averageRating,
            'contactNames' => $contactNames,
            'upcomingAppointments' => $upcomingAppointments,
            'upcomingEvents' => $upcomingEvents,
            'staffAvailability' => $staffAvailability,
        ]);
    }

    public function calendar()
    {
        $packages = Package::get()->where('status', 'published');
        $promo = Package::orderBy('package_promo', 'desc')->where('status', 'published')->first();

        // Fetch bookings
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

        // Fetch blocked dates
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

        // Fetch blocked dates
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
        // Fetch appointments
        // $appointments = Appointments::where('status', 'reserved')
        //     ->select('appointment_id', 'appointment_date', 'appointment_time_from', 'appointment_time_to', 'status')
        //     ->get()
        //     ->groupBy('appointment_date');

        // $appointmentTimes = [];
        // foreach ($appointments as $items) {
        //     foreach ($items as $row) {
        //         $date = Carbon::parse($row->appointment_date)->format('Y-m-d');
        //         $appointmentTimes[$date][] = [
        //             'from' => $row->appointment_time_from,
        //             'to' => $row->appointment_time_to,
        //             'status' => $row->status,
        //         ];
        //     }
        // }

        return Inertia::render('homepage/calendar', [
            'bookedTimes' => $bookedTimes,
            'blockedtimes' => $blockedtimes,
            'servicebookingtimes' => $servicebookingtimes,
            
            // 'appointmentTimes' => $appointmentTimes,
            'packages' => $packages,
            'promo' => $promo,


        ]);
    }

    public function package($id)
    {
        $package = Package::with('services')->findOrFail($id);
        $packages = Package::get()->where('status', 'published');
        $promo = Package::orderBy('package_promo', 'desc')->where('status', 'published')->first();

        return Inertia::render('homepage/package-details', [
            'package' => $package,
            'packages' => $packages,
            'promo' => $promo,
        ]);
   
    }

}
