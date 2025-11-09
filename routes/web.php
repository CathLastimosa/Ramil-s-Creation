<?php

use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Events\AppointmentCreated;
use Illuminate\Support\Facades\Broadcast;

Route::get('/admin', function () { //landing page for admin
    return Inertia::render('welcome');
})->name('welcome');

Route::prefix('package')->group(function () {
    Route::get('{id}', [HomeController::class, 'package'])->name('home.package');
});

Route::get('/', [HomeController::class, 'home'])->name('home.index'); //ladning page for customer

Route::get('/calendar', [HomeController::class, 'calendar'])->name('home.calendar');

Broadcast::routes(['middleware' => ['auth', 'web']]);

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [HomeController::class, 'dashboard'])->name('dashboard');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/package.php';
require __DIR__ . '/booking.php';
require __DIR__ . '/messages.php';
require __DIR__ . '/staff.php';
require __DIR__ . '/feedback.php';
require __DIR__ . '/report.php';
require __DIR__ . '/calendar.php';
require __DIR__ . '/user-manual.php';
require __DIR__ . '/shared-bookings.php';
