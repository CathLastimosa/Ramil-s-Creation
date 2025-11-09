<?php

namespace App\Notifications;

use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

class VerifyBookingEmail extends Notification 
{
    use Queueable;

    protected $booking;

    /**
     * Create a new notification instance.
     */
    public function __construct($booking)
    {
        $this->booking = $booking;
    }

    /**
     * Get the notification's delivery channels.
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
        $url = URL::temporarySignedRoute(
            'booking.verify',
            Carbon::now()->addMinutes(60),
            ['booking' => $this->booking->getKey()]
        );

        return (new MailMessage)
            ->subject('Please Verify Your Booking Email')
            ->greeting('Hello ' . $this->booking->contact_name . ',')
            ->line('Thank you for making a booking with Ramil’s Creation!')
            ->line('To confirm your booking and proceed, please verify your email address by clicking the button below.')
            ->action('Verify My Email', $url)
            ->line('This link will expire in 60 minutes for your security.')
            ->line('If you did not make this booking, please ignore this message.')
            ->salutation('Best regards, Ramil’s Creation Team');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [];
    }
}
