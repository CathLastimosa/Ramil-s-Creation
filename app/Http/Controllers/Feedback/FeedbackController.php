<?php

namespace App\Http\Controllers\Feedback;

use App\Http\Controllers\Controller;
use App\Models\Feedbacks;
use App\Http\Requests\Feedback\storeFeedbackRequest;
use Illuminate\Http\Request;
use App\Models\Bookings;
use Inertia\Inertia;

class FeedbackController extends Controller
{
    /*
     * Show the form for creating a new resource.
     */
    public function create(Request $request, Bookings $booking)
    {
        return Inertia::render('Feedbacks/send-feedback', [
            'booking_id' => $booking->booking_id,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(storeFeedbackRequest $request)
    {
        $feedback = $request->validated();

        Feedbacks::create([
            'booking_id' => $feedback['booking_id'],
            'rating_emote' => $feedback['rating'],
            'feedback' => $feedback['feedback'],
        ]);
        return redirect('/home')->with('success', [
            'message' => 'Thank you for your feedback!',
            'feedback' => [
                'statements' => [
                    'Your feedback helps us improve our services!',
                    'We appreciate your time and thoughts.',
                    'Thank you for being part of Ramils Creation family!'
                ]
            ]
        ]);
    }
}
