<?php

namespace App\Jobs;

use App\Models\EmailNotification;
use App\Notifications\BookingSuccessful;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendBookingSuccessfulNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $booking;
    protected $notificationId;

    /**
     * Create a new job instance.
     */
    public function __construct($booking, $notificationId = null)
    {
        $this->booking = $booking;
        $this->notificationId = $notificationId;
    }

    /**
     * Execute the job.
     */
    public function handle()
    {
        try {
            $this->booking->notify(new BookingSuccessful($this->booking));

            if ($this->notificationId) {
                EmailNotification::where('id', $this->notificationId)
                    ->update(['status' => 'sent']);
            }
        } catch (\Throwable $e) {
            if ($this->notificationId) {
                EmailNotification::where('id', $this->notificationId)
                    ->update(['status' => 'failed']);
            }
        }
    }
}
