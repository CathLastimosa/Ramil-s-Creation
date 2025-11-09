<?php

namespace App\Http\Controllers\Booking;

use App\Http\Controllers\Controller;
use App\Http\Requests\Appointment\StoreAppointmentRequest;
use App\Models\Appointments;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\EmailNotification;
use App\Jobs\SendAppointmentNotification;
use App\Events\AppointmentCreated;
class AppointmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $appointments = Appointments::where('status', 'reserved')
            ->select('appointment_id', 'appointment_date', 'appointment_time_from', 'appointment_time_to', 'status')
            ->get()
            ->groupBy('appointment_date');

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

        return Inertia::render('Appointment', [
            'appointmentTimes' => $appointmentTimes,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAppointmentRequest $request)
    {
        $validated = $request->validated();

        $dateTimeParts = explode(' ', $validated['datetime']);
        $date = $dateTimeParts[0] ?? null;
        $timeRange = $dateTimeParts[1] ?? '';
        [$from, $to] = explode('-', $timeRange) + [null, null];

        $purpose = implode(', ', $validated['purposeTags']);

        $appointment = Appointments::create([
            'purpose' => $purpose,
            'appointment_date' => $date,
            'appointment_time_from' => $from,
            'appointment_time_to' => $to,
            'contact_name' => $validated['fullName'],
            'contact_email' => $validated['email'],
            'contact_phone' => $validated['phone'],
            'status' => 'reserved',
        ]);

         $notification = EmailNotification::create([
            'subject' => 'Appointment Submitted',
            'recipient_type' => 'customer',
            'recipient_id' => $appointment->appointment_id,
            'recipient_email' => $appointment->contact_email,
            'type' => 'submission',
            'status' => 'pending',
        ]);

        SendAppointmentNotification::dispatch( $appointment, $notification->id);

        event(new AppointmentCreated($appointment));
        
        return redirect()->back()->with('success', [
            'message' => 'Thank you for booking an appointment with us!',
            'appointment' => [
                'appointment_id' => $appointment->appointment_id,
                'contact_email' => $appointment->contact_email,
            ],
        ]);
    }

}
