<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Staff;
use App\Models\StaffAvailability;

class StaffAvailabilityController extends Controller
{

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $staff_id)
    {
        $staff = Staff::with('availability')->findOrFail($staff_id);
        return Inertia::render('EditStaff/staff-availability', [
            'staff' => $staff,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $staff_id)
    {
        $validated = $request->validate([
            'availability' => 'nullable|array',
            'availability.*.start_time' => 'nullable|string',
            'availability.*.end_time' => 'nullable|string',
            'availability.*.status' => 'nullable|in:available,blocked',
        ]);

        $staff = Staff::findOrFail($staff_id);

        // Delete existing availability records
        StaffAvailability::where('staff_id', $staff_id)->delete();

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
                'staff_id' => $staff_id,
                'day_of_week' => $day,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'status' => $status,
                'reason' => $reason,
            ]);
        }

        return redirect()->route('staff.index')->with('success', 'Staff availability updated successfully.');
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
