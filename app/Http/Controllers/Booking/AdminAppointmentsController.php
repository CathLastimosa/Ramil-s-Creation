<?php

namespace App\Http\Controllers\Booking;

use App\Http\Controllers\Controller;
use App\Http\Requests\Appointment\StoreAppointmentRequest;
use App\Models\Appointments;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\BlockedDate;
use App\Notifications\AppointmentSuccessfulNotification;
use App\Models\EmailNotification;
use App\Jobs\SendAppointmentNotification;

class AdminAppointmentsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Appointments::latest();

        if ($request->has('search') && $request->search != null) {
            $query->where(function ($q) use ($request) {
                $q->where('appointment_id', 'like', '%' . $request->search . '%')
                    ->orWhere('purpose', 'like', '%' . $request->search . '%')
                    ->orWhere('status', 'like', '%' . $request->search . '%')
                    ->orWhere('appointment_date', 'like', '%' . $request->search . '%')
                    ->orWhere('contact_name', 'like', '%' . $request->search . '%')
                    ->orWhere('appointment_time_from', 'like', '%' . $request->search . '%')
                    ->orWhere('appointment_time_to', 'like', '%' . $request->search . '%');
            });
        }

        $appointments = $query->paginate(perPage: 10);

        return Inertia::render('ManageAppointments', [
            'appointments' => $appointments,
        ]);
    }

    public function create()
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

        return Inertia::render('Appointment/add-appointment-layout', [
            'appointmentTimes' => $appointmentTimes,
            'blockedtimes' => $blockedtimes,
        ]);
    }

    public function store(StoreAppointmentRequest $request)
    {
        $validated = $request->validated();

        // Parse datetime
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

        SendAppointmentNotification::dispatch($appointment, $notification->id);

        return redirect()->route('adminappointments.index')
            ->with('success', 'Appointment created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $appointment = Appointments::findOrFail($id);

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

        return Inertia::render('EditAppointment/appointment', [
            'appointment' => $appointment,
            'appointmentTimes' => $appointmentTimes,
            'blockedtimes' => $blockedtimes,
        ]);
    }

    public function updateAppointmentStatus(string $id)
    {
        $appointment = Appointments::findOrFail($id);
        $appointment->status = 'completed';
        $appointment->save();

        return redirect()->back()->with('success', 'Appointment has been marked as completed.');
    }

    public function destroy(string $id): RedirectResponse
    {
        $appointment = Appointments::findOrFail($id);
        $appointment->delete();

        return redirect()->back()->with('success', 'Appointment deleted successfully.');
    }

    /**
     * Update appointment details
     */
    public function update(Request $request, string $id)
    {
        $data = $request->validate([
            'purpose' => 'nullable|string|max:255',
            'contact_name' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'appointment_date' => 'nullable|date',
            'appointment_time_from' => 'nullable|date_format:H:i',
            'appointment_time_to' => 'nullable|date_format:H:i',
        ]);

        $appointment = Appointments::where('appointment_id', $id)->firstOrFail();

        $appointment->update($data);
        return redirect()->route('adminappointments.index')->with('success', 'Appointment updated successfully.');
    }
}
