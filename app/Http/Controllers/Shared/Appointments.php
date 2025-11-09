<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\AssignedStaff;
use App\Models\Staff;

class Appointments extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('search');

        $appointmentQuery = AssignedStaff::with([
                'staff',
                'booking', 
            ])
            ->where('booking_type', 'appointment')
            ->whereHas('booking')
            ->whereHas('staff');

        if ($search) {
            $appointmentQuery->where(function($q) use ($search) {
                $q->whereHas('booking', function($bq) use ($search) {
                    $bq->where('event_name', 'like', '%' . $search . '%'); // or appointment_name if different
                })
                ->orWhereHas('staff', function($sq) use ($search) {
                    $sq->where('staff_name', 'like', '%' . $search . '%');
                });
            });
        }

        $assignedAppointmentStaff = $appointmentQuery->get();

        $staff = Staff::with('availability')->get();

        return Inertia::render('Shared/appointments', [
            'assignedAppointmentStaff' => $assignedAppointmentStaff,
            'staff' => $staff,
        ]);
    }

}
