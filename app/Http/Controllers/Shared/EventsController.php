<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\AssignedStaff;
use App\Models\Staff;
use App\Models\Bookings;

class EventsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('search');

        $eventQuery = AssignedStaff::with([
            'staff',
            'booking',
        ])
            ->where('booking_type', 'event')
            ->whereHas('booking')
            ->whereHas('staff');

        if ($search) {
            $eventQuery->where(function ($q) use ($search) {
                $q->whereHas('booking', function ($bq) use ($search) {
                    $bq->where('event_name', 'like', '%' . $search . '%');
                })
                    ->orWhereHas('staff', function ($sq) use ($search) {
                        $sq->where('staff_name', 'like', '%' . $search . '%');
                    });
            });
        }

        $assignedEventStaff = $eventQuery->get();

        $staff = Staff::with('availability')->get();

        // Get all event bookings
        $bookingsQuery = Bookings::where('event_type', '!=', null); // Assuming event_type is not null for events

        if ($search) {
            $bookingsQuery->where('event_name', 'like', '%' . $search . '%');
        }

        $bookings = $bookingsQuery->get();

        return Inertia::render('Shared/events', [
            'assignedEventStaff' => $assignedEventStaff,
            'staff' => $staff,
            'bookings' => $bookings,
        ]);
    }

}
