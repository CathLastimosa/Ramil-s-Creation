<?php

namespace App\Jobs;

use App\Models\EmailNotification;
use App\Notifications\MessageSendingNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendMessageNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $receiver;
    protected $notificationData;
    protected $notificationId;

    public function __construct($receiver, $notificationData, $notificationId = null)
    {
        $this->receiver = $receiver;
        $this->notificationData = $notificationData;
        $this->notificationId = $notificationId;
    }

    public function handle()
    {
        try {
            if (method_exists($this->receiver, 'notify')) {
                $this->receiver->notify(new MessageSendingNotification($this->notificationData));
            }

            if ($this->notificationId) {
                EmailNotification::where('id', $this->notificationId)
                    ->update(['status' => 'sent']);
            }

            Log::info('Notification sent', ['receiver_type' => get_class($this->receiver)]);
        } catch (\Throwable $e) {
            if ($this->notificationId) {
                EmailNotification::where('id', $this->notificationId)
                    ->update(['status' => 'failed']);
            }

            Log::error('Notification failed', ['error' => $e->getMessage()]);
        }
    }
}
