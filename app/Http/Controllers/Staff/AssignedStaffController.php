<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\AssignedStaff;
use App\Models\Staff;


class AssignedStaffController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'booking_id' => 'nullable|exists:event_bookings,booking_id',
            'service_booking_id' => 'nullable|exists:service_bookings,service_booking_id',
            'staff_ids' => 'required|array',
            'staff_ids.*' => 'exists:staff,staff_id',
            'assigned_role' => 'required|string|max:255',
            'booking_type' => 'required|in:event,service',
        ]);

        $staffIds = $request->staff_ids;
        $assignedRole = $request->assigned_role;
        $bookingType = $request->booking_type;
        $bookingId = $request->booking_id;
        $serviceBookingId = $request->service_booking_id;

        foreach ($staffIds as $staffId) {
            AssignedStaff::create([
                'booking_id' => $bookingId,
                'service_booking_id' => $serviceBookingId,
                'staff_id' => $staffId,
                'assigned_role' => $assignedRole,
                'booking_type' => $bookingType,
            ]);
        }

        return redirect()->back()->with('success', 'Staff assigned successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $assignedStaff = AssignedStaff::findOrFail($id);
        $assignedStaff->delete();

        return redirect()->back()->with('success', 'Staff unassigned successfully.');
    }
}
