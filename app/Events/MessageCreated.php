<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;
    public $message;

    /**
     * Create a new event instance.
     */
    public function __construct($message)
    {
        $this->message = $message;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('appointments'),
        ];
    }
    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'message' => [
                'message_id' => $this->message->message_id ?? ($this->message['message_id'] ?? null),
                'sender_id' => $this->message->sender_id ?? ($this->message['sender_id'] ?? null),
                'sender_type' => $this->message->sender_type ?? ($this->message['sender_type'] ?? null),
                'receiver_id' => $this->message->receiver_id ?? ($this->message['receiver_id'] ?? null),
                'receiver_type' => $this->message->receiver_type ?? ($this->message['receiver_type'] ?? null),
                'subject' => $this->message->subject ?? ($this->message['subject'] ?? null),
                'message' => $this->message->message ?? ($this->message['message'] ?? null),
            ],
            'type' => 'message',
        ];
    }

    public function broadcastAs(): string
    {
        return 'appointments.store';
    }
}