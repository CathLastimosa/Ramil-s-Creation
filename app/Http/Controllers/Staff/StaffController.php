<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Staff;
use App\Models\StaffAvailability; // Ensure this model exists; create if needed

class StaffController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Staff::with('availability', 'bookings', 'serviceBookings')->latest();

        if ($request->has('search') && $request->search != null) {
            $query->where(function ($q) use ($request) {
                $q->where('staff_name', 'like', '%' . $request->search . '%')
                    ->orWhere('email', 'like', '%' . $request->search . '%')
                    ->orWhere('contact_no', 'like', '%' . $request->search . '%')
                    ->orWhere('role', 'like', '%' . $request->search . '%')
                    ->orWhere('status', 'like', '%' . $request->search . '%');
            });
        }

        $staffMembers = $query->get();

        return Inertia::render('Staff/staff', [
            'staff' => $staffMembers,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:staff,email',
            'contact' => 'nullable|string|max:20',
            'role' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:50',
            'availability' => 'nullable|array',
            'availability.*.start_time' => 'nullable|string',
            'availability.*.end_time' => 'nullable|string',
            'availability.*.status' => 'nullable|in:available,blocked',
        ]);

        $staff = Staff::create([
            'staff_name' => $validated['name'],
            'email' => $validated['email'],
            'contact_no' => $validated['contact'],
            'role' => $validated['role'],
            'color' => $validated['color'],
            'status' => 'active', // Default status
        ]);

        // Handle availability: Create records for all days
        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        $availabilityData = $validated['availability'] ?? [];
        foreach ($days as $day) {
            $dayData = $availabilityData[$day] ?? ['status' => 'available', 'start_time' => null, 'end_time' => null];
            $status = $dayData['status'] ?? 'available';
            $startTime = null;
            $endTime = null;
            $reason = null;

            if ($status === 'available') {
                // Convert 12-hour AM/PM to 24-hour time for DB
                if (!empty($dayData['start_time'])) {
                    $startTime = $this->convertTo24HourTime($dayData['start_time']);
                }
                if (!empty($dayData['end_time'])) {
                    $endTime = $this->convertTo24HourTime($dayData['end_time']);
                }
                // If no times provided (e.g., business hours default), use business defaults
                if (empty($startTime) || empty($endTime)) {
                    $startTime = $this->convertTo24HourTime('07:00 AM'); // Default start
                    $endTime = $this->convertTo24HourTime('08:00 PM');   // Default end
                }
            } elseif ($status === 'blocked') {
                $startTime = null;
                $endTime = null;
                // Could set reason if provided, but not in form
            }

            StaffAvailability::create([
                'staff_id' => $staff->staff_id,
                'day_of_week' => $day,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'status' => $status,
                'reason' => $reason,
            ]);
        }

        return back()->with('success', 'Staff created successfully.');
    }

    public function index2(Request $request)
    {
        $booking = Staff::with('bookings', 'availability', 'serviceBookings')->get();
        return $booking;
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $staff = Staff::findOrFail($id);
        return Inertia::render('EditStaff/staff-details',[
            'staff' => $staff,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:staff,email,' . $id . ',staff_id',
            'contact' => 'nullable|string|max:20',
            'role' => 'nullable|string|max:50',
            'status' => 'nullable|in:active,inactive',
        ]);

        $staff = Staff::findOrFail($id);
        $staff->update([
            'staff_name' => $validated['name'],
            'email' => $validated['email'],
            'contact_no' => $validated['contact'],
            'role' => $validated['role'],
            'status' => $validated['status'] ?? $staff->status,
        ]);

        return redirect()->route('staff.index')->with('success', 'Staff updated successfully.');
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:active,inactive',
        ]);

        $staff = Staff::findOrFail($id);
        $staff->update(['status' => $request->status]);

        return back()->with('success', 'Staff status updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $staff = Staff::findOrFail($id);
        $staff->delete();

        return back()->with('success', 'Staff deleted successfully.');
    }

    /**
     * Convert 12-hour AM/PM time string (e.g., "07:00 AM") to 24-hour time (e.g., "07:00:00").
     */
    private function convertTo24HourTime(string $timeStr): ?string
    {
        // Parse the input: e.g., "07:00 AM" or "8:30 PM"
        if (preg_match('/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i', $timeStr, $matches)) {
            $hour = (int) $matches[1];
            $minute = (int) $matches[2];
            $ampm = strtoupper($matches[3]);

            // Adjust hour for PM (except 12 PM)
            if ($ampm === 'PM' && $hour !== 12) {
                $hour += 12;
            } elseif ($ampm === 'AM' && $hour === 12) {
                $hour = 0;
            }

            // Format as HH:MM:SS
            return sprintf('%02d:%02d:00', $hour, $minute);
        }

        return null; // Invalid format
    }
}
