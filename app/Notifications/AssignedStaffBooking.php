<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AssignedStaffBooking extends Notification
{
    use Queueable;

    protected $booking;

    public function __construct($booking)
    {
        $this->booking = $booking;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('You’ve Been Assigned to a Booking')
            ->greeting('Hello ' . $notifiable->staff_name . ',')
            ->line('You have been assigned to assist with the following event:')
            ->line('Event Name: ' . $this->booking->event_name)
            ->line('Event Date: ' . $this->booking->event_date)
            ->line('Time: ' . $this->booking->event_time_from . ' - ' . $this->booking->event_time_to)
            ->line('Client: ' . $this->booking->contact_name)
            ->line('Location: ' . $this->booking->street_address . ', ' . $this->booking->city)
            ->line('Please confirm your availability and prepare accordingly.')
            ->line('Thank you for being part of the team!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'booking_id' => $this->booking->booking_id,
            'event_name' => $this->booking->event_name,
            'event_date' => $this->booking->event_date,
        ];
    }
}
