<?php

namespace App\Console\Commands;

use App\Models\ServiceBooking;
use App\Models\AssignedStaff;
use App\Models\EmailNotification;
use App\Notifications\UpcomingServiceReminder;
use App\Notifications\StaffServiceReminder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Log;

class SendUpcomingServiceBooking extends Command
{
    protected $signature = 'app:send-upcoming-service-booking';
    protected $description = 'Send reminder emails for upcoming service bookings 3 days and a day before the booking date';

    public function handle()
    {
        $serviceBookings = ServiceBooking::where('status', 'confirmed')
            ->whereDate('date', '>=', now()->toDateString())
            ->whereDate('date', '<=', now()->addDays(3)->toDateString())
            ->get();

        $remindersSent = 0;
        $staffRemindersSent = 0;

        foreach ($serviceBookings as $serviceBooking) {
            $daysBefore = now()->startOfDay()->diffInDays($serviceBooking->date);

            // Customer reminder
            if (($daysBefore == 1 || $daysBefore == 3) && $serviceBooking->contact_email) {

                Notification::route('mail', $serviceBooking->contact_email)
                    ->notify(new UpcomingServiceReminder($serviceBooking, $daysBefore));

                $this->info("Sent {$daysBefore}-day reminder to: {$serviceBooking->contact_email}");
                $remindersSent++;
                sleep(10);
            }

            // Staff reminder
            if ($daysBefore == 1 || $daysBefore == 3) {
                $assignedStaff = AssignedStaff::where('service_booking_id', $serviceBooking->service_booking_id)
                    ->where('booking_type', 'service')
                    ->with('staff')
                    ->get();

                foreach ($assignedStaff as $assignment) {
                    if ($assignment->staff && $assignment->staff->email) {

                        Notification::route('mail', $assignment->staff->email)
                            ->notify(new StaffServiceReminder($serviceBooking, $daysBefore));

                        $this->info("Sent {$daysBefore}-day staff reminder to: {$assignment->staff->email} for service: {$serviceBooking->service_name}");
                        $staffRemindersSent++;
                        sleep(10);
                    }
                }
            }
        }

        $this->info("Reminders sent for {$remindersSent} upcoming service bookings.");
        $this->info("Staff reminders sent for {$staffRemindersSent} assignments.");
    }
}
