<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StaffEventReminder extends Notification
{

    protected $event;
    protected $daysBefore;

    public function __construct($event, $daysBefore = 1)
    {
        $this->event = $event;
        $this->daysBefore = $daysBefore;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $subject = 'Reminder: Upcoming Event Assignment';

        if ($this->daysBefore == 1) {
            $intro = 'This is a reminder that you are assigned to an event happening tomorrow!';
        } elseif ($this->daysBefore == 3) {
            $intro = 'This is a reminder that you are assigned to an event happening in 3 days!';
        } else {
            $intro = 'This is a reminder that you are assigned to an event happening soon!';
        }

        return (new MailMessage)
            ->subject($subject)
            ->greeting('Hello ' . $notifiable->staff_name . '!')
            ->line($intro)
            ->line('Event: ' . $this->event->event_name)
            ->line('Date: ' . date('F j, Y', strtotime($this->event->event_date)))
            ->line('Time: ' . $this->event->event_time_from . ' - ' . $this->event->event_time_to)
            ->line('Location: ' . $this->event->street_address . ', ' . $this->event->city . ', ' . $this->event->province)
            ->salutation('Ramils Creation');
    }

    public function toArray(object $notifiable): array
    {
        return [];
    }
}
