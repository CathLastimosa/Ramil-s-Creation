<?php

namespace App\Console\Commands;

use App\Models\Bookings;
use App\Models\AssignedStaff;
use App\Models\EmailNotification;
use App\Notifications\UpcomingEventReminder;
use App\Notifications\StaffEventReminder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Notification;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class SendUpcomingEventReminders extends Command
{
    protected $signature = 'events:send-reminders';
    protected $description = 'Send reminder emails for upcoming events 3 days and a day before the event date';

    public function handle()
    {
        $events = Bookings::where('status', 'confirmed')
            ->whereDate('event_date', '>=', now()->toDateString())
            ->whereDate('event_date', '<=', now()->addDays(3)->toDateString())
            ->get();

        $remindersSent = 0;
        $staffRemindersSent = 0;

        foreach ($events as $event) {
            $daysBefore = now()->startOfDay()->diffInDays($event->event_date);

            // Customer reminder
            if (($daysBefore == 1 || $daysBefore == 3) && $event->contact_email) {

                Notification::route('mail', $event->contact_email)
                    ->notify(new UpcomingEventReminder($event, $daysBefore));

                $this->info("Sent {$daysBefore}-day reminder to: {$event->contact_email}");
                $remindersSent++;
                sleep(10);
            }

            // Staff reminder
            if ($daysBefore == 1 || $daysBefore == 3) {
                $assignedStaff = AssignedStaff::where('booking_id', $event->booking_id)
                    ->where('booking_type', 'event')
                    ->with('staff')
                    ->get();

                foreach ($assignedStaff as $assignment) {
                    if ($assignment->staff && $assignment->staff->email) {

                        Notification::route('mail', $assignment->staff->email)
                            ->notify(new StaffEventReminder($event, $daysBefore));

                        $this->info("Sent {$daysBefore}-day staff reminder to: {$assignment->staff->email} for event: {$event->event_name}");
                        $staffRemindersSent++;
                        sleep(10);
                    }
                }
            }
        }

        $this->info("Reminders sent for {$remindersSent} upcoming events.");
        $this->info("Staff reminders sent for {$staffRemindersSent} assignments.");
    }
}
