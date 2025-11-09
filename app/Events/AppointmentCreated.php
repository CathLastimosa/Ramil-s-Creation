<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AppointmentCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $appointment;

    /**
     * Create a new event instance.
     */
    public function __construct($appointment)
    {
        $this->appointment = $appointment;
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
            'appointment' => [
                'appointment_id' => $this->appointment->appointment_id ?? ($this->appointment['appointment_id'] ?? null),
                'contact_name' => $this->appointment->contact_name ?? ($this->appointment['contact_name'] ?? null),
                'contact_email' => $this->appointment->contact_email ?? ($this->appointment['contact_email'] ?? null),
                'appointment_date' => $this->appointment->appointment_date ?? ($this->appointment['appointment_date'] ?? null),
                'appointment_time_from' => $this->appointment->appointment_time_from ?? ($this->appointment['appointment_time_from'] ?? null),
                'appointment_time_to' => $this->appointment->appointment_time_to ?? ($this->appointment['appointment_time_to'] ?? null),
            ],
            'type' => 'appointment',
        ];
    }

    public function broadcastAs(): string
    {
        return 'appointments.store';
    }
}