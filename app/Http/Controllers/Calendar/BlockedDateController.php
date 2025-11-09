<?php

namespace App\Http\Controllers\Calendar;

use App\Http\Controllers\Controller;
use App\Models\BlockedDate;
use Illuminate\Http\Request;

class BlockedDateController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'date' => 'required|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'reason' => 'nullable|string',
        ]);

        $blocked = BlockedDate::create([
            'date' => $data['date'],
            'start_time' => $data['start_time'] ?? null,
            'end_time' => $data['end_time'] ?? null,
            'reason' => $data['reason'] ?? null,
        ]);

        return response()->json($blocked);
    }
    
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $blockedDate)
    {
        try {
            $blocked = BlockedDate::find($blockedDate);

            if (!$blocked) {
                return response()->json(['error' => 'Blocked date not found'], 404);
            }

            $blocked->delete();

            return response()->json(['message' => 'Blocked date deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An error occurred while deleting the blocked date'], 500);
        }
    }
}
