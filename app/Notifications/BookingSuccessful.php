<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\EmailNotification;
use Illuminate\Support\Facades\Log;

class BookingSuccessful extends Notification
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
            ->subject('Your Booking Has Been Successfully Submitted!')
            ->greeting('Hello ' . ($this->booking->contact_name ?? 'Guest') . ',')
            ->line('We’re excited to let you know that your booking has been successfully verified!')
            ->line('Here are the details of your booking:')
            ->line('Transaction Number: ' . $this->booking->transaction_number)
            ->line('Event: ' . $this->booking->event_name)
            ->line('Date: ' . optional($this->booking->event_date)->format('F d, Y'))
            ->line('To help you stay updated, please take note of the following:')
            ->line('1. Visit the Tracking Page to monitor the status of your booking.')
            ->line('2. If you have additional requests or updates, you can send us a message directly from there.')
            ->line('3. Please make sure your contact details are active so our team can reach you for confirmation or updates.')
            ->line('Thank you for trusting ' . config('app.name') . ' to be part of your event. We’re looking forward to making it truly special!')
            ->line('If you have any questions or special requests, feel free to contact us or message us in the Tracking Page.');
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
