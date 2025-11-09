<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UpcomingServiceReminder extends Notification
{

    protected $serviceBooking;
    protected $daysBefore;

    /**
     * Create a new notification instance.
     */
    public function __construct($serviceBooking, $daysBefore = 1)
    {
        $this->serviceBooking = $serviceBooking;
        $this->daysBefore = $daysBefore;
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
        $subject = 'Reminder: Upcoming Service Booking';

        if ($this->daysBefore == 1) {
            $intro = 'This is a reminder that your service booking is happening tomorrow!';
        } elseif ($this->daysBefore == 3) {
            $intro = 'This is a reminder that your service booking is happening in 3 days!';
        } else {
            $intro = 'This is a reminder that your service booking is happening soon!';
        }

        return (new MailMessage)
            ->subject($subject)
            ->greeting('Hello ' . $this->serviceBooking->contact_name . '!')
            ->line($intro)
            ->line('Service: ' . $this->serviceBooking->service_name)
            ->line('Date: ' . date('F j, Y', strtotime($this->serviceBooking->date)))
            ->line('Time: ' . $this->serviceBooking->start_time . ' - ' . $this->serviceBooking->end_time)
            ->salutation('Ramils Creation');
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
