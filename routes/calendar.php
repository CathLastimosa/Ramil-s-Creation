<?php

use App\Http\Controllers\Calendar\AppointmentCalendarController;
use App\Http\Controllers\Calendar\BlockedDateController;
use App\Http\Controllers\Calendar\BookingCalendarController;
use App\Http\Controllers\Calendar\EventCalendarController;
use App\Http\Controllers\Calendar\ServiceBookingCalendarController;
use App\Http\Controllers\Calendar\UpdateAppointmentCalendarController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {

    Route::prefix('event-calendar')->group(function () {
        Route::get('/', [EventCalendarController::class, 'index'])->name('calendar.index');
    });

    Route::prefix('blocked-dates')->name('calendar.')->group(function () {
        Route::post('/', [BlockedDateController::class, 'index'])->name('blocked-dates.index');
        Route::post('store', [BlockedDateController::class, 'store'])->name('blocked-dates.store');
        Route::put('update/{blockedDate}', [BlockedDateController::class, 'update'])->name('blocked-dates.update');
        Route::delete('destroy/{blockedDate}', [BlockedDateController::class, 'destroy'])->name('blocked-dates.destroy');
    });

    Route::prefix('update-appointment-calendar')->group(function () {
        Route::put('{id}', [UpdateAppointmentCalendarController::class, 'update'])->name('update-appointment-calendar.update');
        Route::delete('{id}', [UpdateAppointmentCalendarController::class, 'destroy'])->name('update-appointment-calendar.destroy');
    });

    Route::prefix('booking-calendar')->group(function () {
        Route::get('packages', [BookingCalendarController::class, 'packages'])->name('booking-calendar.packages');
        Route::get('packages/{id}/services', [BookingCalendarController::class, 'packageServices'])->name('booking-calendar.package-services');
        Route::put('store', [BookingCalendarController::class, 'store'])->name('booking-calendar.store');
        Route::put('{id}', [BookingCalendarController::class, 'update'])->name('booking-calendar.update');
        Route::delete('{id}', [BookingCalendarController::class, 'destroy'])->name('booking-calendar.destroy');
    });

    Route::prefix('service-booking-calendar')->group(function () {
        Route::post('store', [ServiceBookingCalendarController::class, 'store'])->name('service-booking-calendar.store');
        Route::put('{id}', [ServiceBookingCalendarController::class, 'update'])->name('service-booking-calendar.update');
        Route::delete('{id}', [ServiceBookingCalendarController::class, 'destroy'])->name('service-booking-calendar.destroy');
    });

    Route::prefix('appointment-calendar')->group(function () {
        Route::post('store', [AppointmentCalendarController::class, 'store'])->name('appointment-calendar.store');
        Route::put('{id}', [AppointmentCalendarController::class, 'update'])->name('appointment-calendar.update');
        Route::delete('{id}', [AppointmentCalendarController::class, 'destroy'])->name('appointment-calendar.destroy');
    });
});
