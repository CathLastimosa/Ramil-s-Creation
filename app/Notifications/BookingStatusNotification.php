<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingStatusNotification extends Notification
{
    use Queueable;

    public $booking;
    public $message;

    /**
     * Create a new notification instance.
     */
    public function __construct($booking, $message)
    {
        $this->booking = $booking;
        $this->message = $message;

    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Booking Update: ' . ucfirst($this->booking->status))
            ->greeting('Hello ' . $this->booking->contact_name . ',')
            ->line('We’d like to inform you of an update regarding your booking.')
            ->line($this->message)
            ->line('Event: ' . $this->booking->event_name)
            ->line('Date: ' . optional($this->booking->event_date)->format('F d, Y'))
            ->line('Current Status: ' . ucfirst($this->booking->status))
            ->line('If you have any questions or need further assistance, please don’t hesitate to reach out to us.')
            ->line('Thank you for choosing **' . config('app.name') . '** — we appreciate your continued trust and support.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
