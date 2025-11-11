<?php

namespace App\Http\Controllers\Booking;

use App\Http\Controllers\Controller;
use App\Models\Bookings;
use App\Notifications\VerifyBookingEmail;
use Illuminate\Http\Request;
use App\Models\EmailNotification;
use App\Jobs\SendBookingSuccessfulNotification;
use App\Events\BookingCreated;

class BookingVerificationController extends Controller
{
    public function verify(Bookings $booking)
    {

        if ($booking->email_verified_at) {
            return redirect('/')->with('message', 'Email already verified.');
        }

        $booking->update(['email_verified_at' => now()]);
        $booking->update(['email_verified' => true]);

        event(new BookingCreated($booking));

        $notification = EmailNotification::create([
            'subject' => 'Booking Submitted',
            'recipient_type' => 'customer',
            'recipient_id' => $booking->booking_id,
            'recipient_email' => $booking->contact_email,
            'type' => 'submission',
            'status' => 'pending',
        ]);

        SendBookingSuccessfulNotification::dispatch($booking, $notification->id);

        return redirect('/')->with('success', [
            'message' => 'Thank you for choosing Ramils Creation!',
            'booking' => [
                'event_name' => $booking->event_name,
                'event_date' => $booking->event_date,
                'event_time' => $booking->event_time_from . ' - ' . $booking->event_time_to,
                'total_amount' => $booking->total_amount,
                'transaction_number' => $booking->transaction_number ?? 'N/A',
            ],
        ]);
    }

    public function resend(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|exists:event_bookings,booking_id',
        ]);

        $booking = Bookings::findOrFail($request->booking_id);

        $booking->notify(new VerifyBookingEmail($booking));

        return back()->with('success', [
            'message' => 'Verification email resent successfully!',
            'booking' => $booking,
        ]);
    }
}
