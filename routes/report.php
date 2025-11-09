<?php

use App\Http\Controllers\Report\ReportController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {

    Route::prefix('report')->group(function () {
        Route::get('/', [ReportController::class, 'index'])->name('report.index');
        Route::delete('{id}/booking-destroy', [ReportController::class, 'bookingDestroy'])->name('booking.report.destroy');
        Route::delete('{id}/appointment-destroy', [ReportController::class, 'appointmentDestroy'])->name('appointment.report.destroy');
        Route::delete('{id}/service-booking-destroy', [ReportController::class, 'serviceBookingDestroy'])->name('service-booking.report.destroy');
    });
});
