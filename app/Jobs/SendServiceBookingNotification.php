<?php

namespace App\Jobs;

use App\Models\EmailNotification;
use App\Notifications\ServiceBookingSuccessfullNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendServiceBookingNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $serviceBooking;
    protected $notificationId;

    public function __construct($serviceBooking, $notificationId)
    {
        $this->serviceBooking = $serviceBooking;
        $this->notificationId = $notificationId;
    }

    public function handle()
    {
        try {
            $this->serviceBooking->notify(
                new ServiceBookingSuccessfullNotification($this->serviceBooking)
            );

            EmailNotification::where('id', $this->notificationId)
                ->update(['status' => 'sent']);
        } catch (\Throwable $e) {
            EmailNotification::where('id', $this->notificationId)
                ->update(['status' => 'failed']);
            Log::error("SendServiceBookingNotification failed: " . $e->getMessage());
        }
    }
}
