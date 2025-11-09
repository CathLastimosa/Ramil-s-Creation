<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ServiceBookingCompletedNotification extends Notification
{
    use Queueable;
    public $booking;

    /**
     * Create a new notification instance.
     */
    public function __construct($booking)
    {
        $this->booking = $booking;
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
            ->subject('Your Booking is Complete!')
            ->greeting('Hello ' . $this->booking->contact_name . ',')
            ->line('We’re delighted to let you know that your booking for ' . $this->booking->event_name . ' has been successfully completed.')
            ->line('Your opinion means a lot to us — it helps us continue improving our services and creating memorable experiences for our clients.')
            ->line('Thank you once again for choosing ' . config('app.name') . '. We truly appreciate your trust and support.');
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
