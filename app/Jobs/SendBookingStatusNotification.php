<?php

namespace App\Jobs;

use App\Models\EmailNotification;
use App\Notifications\BookingStatusNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendBookingStatusNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $booking;
    protected $message;
    protected $notificationId;

    public function __construct($booking, $message, $notificationId = null)
    {
        $this->booking = $booking;
        $this->message = $message;
        $this->notificationId = $notificationId;
    }

    public function handle()
    {
        try {
            $this->booking->notify(new BookingStatusNotification(
                $this->booking,
                $this->message,
            ));

            if ($this->notificationId) {
                EmailNotification::where('id', $this->notificationId)
                    ->update(['status' => 'sent']);
            }
        } catch (\Throwable $e) {
            if ($this->notificationId) {
                EmailNotification::where('id', $this->notificationId)
                    ->update(['status' => 'failed']);
            }
            Log::error("BookingStatusNotification failed: " . $e->getMessage());
        }
    }
}
