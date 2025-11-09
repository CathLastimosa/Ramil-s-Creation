<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

use Inertia\Inertia;
use App\Models\Bookings;
use App\Models\Appointments;
use App\Models\Messages;
use Illuminate\Support\Facades\Auth;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Inertia::share([
            'pendingBookingsCount' => function () {
                return Bookings::where('status', 'pending')->count();
            },
            'reservedAppointmentsCount' => function () {
                return Appointments::where('status', 'reserved')->count();
            },
            'incomingMessagesCount' => function () {
                return Messages::where('sender_type', 'App\Models\Bookings')->count();
            },
            'isAdmin' => fn() => Auth::check(),

        ]);
    }
}
