<?php

namespace App\Http\Controllers\Feedback;

use App\Http\Controllers\Controller;
use App\Models\Feedbacks;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminFeedbackController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $feedbacks = Feedbacks::with('booking')->get();

        $totalReviews = $feedbacks->count();
        $averageRating = $totalReviews > 0 ? round($feedbacks->avg('rating_emote'), 1) : 0;

        $ratingCounts = [];
        for ($i = 1; $i <= 5; $i++) {
            $ratingCounts[$i] = $feedbacks->where('rating_emote', $i)->count();
        }

        return Inertia::render('Feedbacks/feedbacks', [
            'feedbacks' => $feedbacks,
            'totalReviews' => $totalReviews,
            'averageRating' => $averageRating,
            'ratingCounts' => $ratingCounts,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $feedback = Feedbacks::findOrFail($id);
        $feedback->delete();

        return redirect()->back()->with('success', 'Feedback deleted successfully.');
    }
}
