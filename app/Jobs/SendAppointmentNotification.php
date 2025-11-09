<?php

namespace App\Jobs;

use App\Models\EmailNotification;
use App\Notifications\AppointmentSuccessfulNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendAppointmentNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $appointment;
    protected $notificationId;

    public function __construct($appointment, $notificationId)
    {
        $this->appointment = $appointment;
        $this->notificationId = $notificationId;
    }

    public function handle()
    {
        try {
            $this->appointment->notify(
                new AppointmentSuccessfulNotification($this->appointment)
            );
            EmailNotification::where('id', $this->notificationId)
                ->update(['status' => 'sent']);
        } catch (\Throwable $e) {
            EmailNotification::where('id', $this->notificationId)
                ->update(['status' => 'failed']);

            Log::error("SendAppointmentNotification failed: " . $e->getMessage());
        }
    }
}
