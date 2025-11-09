<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\AssignedStaff;
use App\Models\ServiceBooking;
use App\Models\Staff;

class ServiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('search');

        $serviceQuery = AssignedStaff::with([
            'staff',
            'serviceBooking',
        ])
            ->where('booking_type', 'service')
            ->whereHas('serviceBooking')
            ->whereHas('staff');


        if ($search) {
            $serviceQuery->where(function ($q) use ($search) {
                $q->whereHas('serviceBooking', function ($bq) use ($search) {
                    $bq->where('service_name', 'like', '%' . $search . '%')
                        ->orWhere('title', 'like', '%' . $search . '%');
                })
                    ->orWhereHas('staff', function ($sq) use ($search) {
                        $sq->where('staff_name', 'like', '%' . $search . '%');
                    });
            });
        }

        $assignedServiceStaff = $serviceQuery->get();

        $staff = Staff::with('availability')->get();

        // Get all service bookings
        $serviceBookingsQuery = ServiceBooking::query();

        if ($search) {
            $serviceBookingsQuery->where('service_name', 'like', '%' . $search . '%')
                ->orWhere('title', 'like', '%' . $search . '%');
        }

        $serviceBookings = $serviceBookingsQuery->get();

        return Inertia::render('Shared/service', [
            'assignedServiceStaff' => $assignedServiceStaff,
            'staff' => $staff,
            'serviceBookings' => $serviceBookings,
        ]);
    }

}
