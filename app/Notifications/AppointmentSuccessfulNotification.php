<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Carbon\Carbon;
use App\Models\EmailNotification;
use Illuminate\Contracts\Queue\ShouldQueue;

class AppointmentSuccessfulNotification extends Notification
{

    protected $appointment;

    /**
     * Create a new notification instance.
     */
    public function __construct($appointment)
    {
        $this->appointment = $appointment;
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
            ->subject('Appointment Submitted')
            ->greeting('Hello ' . $this->appointment->contact_name . ',')
            ->line('Thank you for scheduling an appointment with Ramils Creation. Your appointment has been successfully reserved.')
            ->line('Appointment Details:')
            ->line('Purpose: ' . $this->appointment->purpose)
            ->line('Date: ' . Carbon::parse($this->appointment->appointment_date)->format('F j, Y'))
            ->line('Time: ' . $this->appointment->appointment_time_from . ' - ' . $this->appointment->appointment_time_to)
            ->line('Contact Information:')
            ->line('Name: ' . $this->appointment->contact_name)
            ->line('Email: ' . $this->appointment->contact_email)
            ->line('Phone: ' . $this->appointment->contact_phone)
            ->line('If you have any questions or need to make changes, please contact us at your earliest convenience.');
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
