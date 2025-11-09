<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BookingCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $booking;

    /**
     * Create a new event instance.
     */
    public function __construct($booking)
    {
        $this->booking = $booking;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        // broadcast on the same channel the app-layout listens to so the toast triggers
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
            'appointment' => [
                'appointment_id' => $this->booking->booking_id ?? ($this->booking['booking_id'] ?? null),
                'contact_name' => $this->booking->contact_name ?? ($this->booking['contact_name'] ?? null),
                'contact_email' => $this->booking->contact_email ?? ($this->booking['contact_email'] ?? null),
                'appointment_date' => $this->booking->event_date ?? ($this->booking['event_date'] ?? null),
                'appointment_time_from' => $this->booking->event_time_from ?? ($this->booking['event_time_from'] ?? null),
                'appointment_time_to' => $this->booking->event_time_to ?? ($this->booking['event_time_to'] ?? null),
            ],
            'type' => 'booking',
        ];
    }

    public function broadcastAs(): string
    {
        // reuse the same event name the frontend listens for
        return 'appointments.store';
    }
}