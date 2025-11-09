<?php

namespace App\Jobs;

use App\Models\EmailNotification;
use App\Notifications\ServiceBookingCompletedNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendServiceBookingCompletedNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $booking;
    protected $notificationId;

    public function __construct($booking, $notificationId)
    {
        $this->booking = $booking;
        $this->notificationId = $notificationId;
    }

    public function handle()
    {
        try {
            $this->booking->notify(new ServiceBookingCompletedNotification($this->booking));

            EmailNotification::where('id', $this->notificationId)
                ->update(['status' => 'sent']);
        } catch (\Throwable $e) {
            EmailNotification::where('id', $this->notificationId)
                ->update(['status' => 'failed']);
            
            Log::error("SendServiceBookingCompletedNotification failed: " . $e->getMessage());
        }
    }
}
