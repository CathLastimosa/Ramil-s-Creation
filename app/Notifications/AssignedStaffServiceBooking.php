<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\ServiceBooking;

class AssignedStaffServiceBooking extends Notification
{
    use Queueable;

    protected $serviceBooking;

    /**
     * Create a new notification instance.
     */
    public function __construct(ServiceBooking $serviceBooking)
    {
        $this->serviceBooking = $serviceBooking;
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
        return (new MailMessage)
            ->subject('You have been assigned to a new service booking')
            ->greeting('Hello ' . $notifiable->staff_name . ',')
            ->line('You have been assigned to a new service booking.')
            ->line('Service: ' . $this->serviceBooking->service_name)
            ->line('Date: ' . $this->serviceBooking->date)
            ->line('Time: ' . $this->serviceBooking->start_time . ' - ' . $this->serviceBooking->end_time)
            ->line('Please confirm your availability and prepare accordingly.')
            ->line('Thank you for being part of the team!');    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'service_booking_id' => $this->serviceBooking->id,
            'service_name' => $this->serviceBooking->service_name,
            'date' => $this->serviceBooking->date,
        ];
    }
}
