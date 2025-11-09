<?php

use App\Http\Controllers\Booking\AdminAppointmentsController;
use App\Http\Controllers\Booking\AdminBookingController;
use App\Http\Controllers\Booking\AppointmentController;
use App\Http\Controllers\Booking\BookingController;
use App\Http\Controllers\Booking\BookingVerificationController;
use App\Http\Controllers\Booking\DisplayServicesInCreateABooking;
use App\Http\Controllers\Booking\ServiceBookingController;
use Illuminate\Support\Facades\Route;

Route::prefix('booking')->group(function () {
    Route::get('{packageId}/services', [DisplayServicesInCreateABooking::class, 'index'])->name('booking.services');
    Route::post('store', [BookingController::class, 'store'])->name('booking.store');
    Route::get('verify/{booking}', [BookingVerificationController::class, 'verify'])->name('booking.verify')->middleware('signed');
    Route::post('resend', [BookingVerificationController::class, 'resend'])->name('booking.resend')->middleware('throttle:6,1');
});

Route::prefix('admin-booking')->group(function () {
    Route::get('/', [AdminBookingController::class, 'index'])->name('adminbooking.index');
    Route::get('{packageId}/create', [AdminBookingController::class, 'create'])->name('adminbooking.create');
    Route::post('store', [AdminBookingController::class, 'store'])->name('adminbooking.store');
    Route::get('{id}/show', [AdminBookingController::class, 'show'])->name('adminbooking.show');
    Route::get('{bookingId}/edit', [AdminBookingController::class, 'edit'])->name('adminbooking.edit');
    Route::put('{id}/update', [AdminBookingController::class, 'update'])->name('adminbooking.update');
    Route::get('{bookingId}/editServices', [AdminBookingController::class, 'editServices'])->name('adminbooking.editServices');
    Route::put('{id}/updateServices', [AdminBookingController::class, 'updateServices'])->name('adminbooking.updateServices');
    Route::delete('{bookingId}/destroy', [AdminBookingController::class, 'destroy'])->name('adminbooking.destroy');
    Route::put('{id}/confirm', [AdminBookingController::class, 'confirm'])->name('adminbooking.confirm');
    Route::put('{id}/decline', [AdminBookingController::class, 'decline'])->name('adminbooking.decline');
    Route::put('{id}/complete', [AdminBookingController::class, 'complete'])->name('adminbooking.complete');
    Route::put('{id}/payment-update', [AdminBookingController::class, 'updatePayment'])->name('adminbooking.payment.update');
    Route::get('{bookingId}/report-pdf', [AdminBookingController::class, 'report'])->name('adminbooking.report.pdf');
    Route::put('{bookingId}/verify-email', [AdminBookingController::class, 'verifyEmail'])->name('adminbooking.verify-email');
});

Route::prefix('service-booking')->group(function () {
    Route::get('/', [ServiceBookingController::class, 'index'])->name('service-bookings.index');
    Route::get('create', [ServiceBookingController::class, 'create'])->name('service-bookings.create');
    Route::get('{id}/edit', [ServiceBookingController::class, 'edit'])->name('service-bookings.edit');
    Route::post('store', [ServiceBookingController::class, 'store'])->name('service-bookings.store');
    Route::put('{id}/update', [ServiceBookingController::class, 'update'])->name('service-bookings.update');
    Route::put('{id}/updatePayment', [ServiceBookingController::class, 'updatePayment'])->name('service-bookings.updatePayment');
    Route::put('{id}/complete', [ServiceBookingController::class, 'complete'])->name('service-bookings.complete');
    Route::delete('{id}/destroy', [ServiceBookingController::class, 'destroy'])->name('service-bookings.destroy');
});

Route::prefix('admin-service-booking')->group(function () {
    Route::put('{id}/update', [ServiceBookingController::class, 'updateDateTime'])->name('admin-service-booking.update');
});

Route::prefix('appointment')->group(function () {
    Route::get('/', [AppointmentController::class, 'index'])->name('appointments.index');
    Route::post('store', [AppointmentController::class, 'store'])->name('appointments.store');
});

Route::prefix('admin-appointments')->group(function () {
    Route::get('/', [AdminAppointmentsController::class, 'index'])->name('adminappointments.index');
    Route::get('create', [AdminAppointmentsController::class, 'create'])->name('adminappointments.create');
    Route::post('store', [AdminAppointmentsController::class, 'store'])->name('adminappointments.store');
    Route::get('{id}/show', [AdminAppointmentsController::class, 'show'])->name('adminappointments.show');
    Route::get('{id}/edit', [AdminAppointmentsController::class, 'edit'])->name('adminappointments.edit');
    Route::put('{id}/update', [AdminAppointmentsController::class, 'update'])->name('adminappointments.update');
    Route::delete('{id}/destroy', [AdminAppointmentsController::class, 'destroy'])->name('adminappointments.destroy');
    Route::put('{id}/update-status', [AdminAppointmentsController::class, 'updateAppointmentStatus'])->name('adminappointments.updateStatus');
});

Route::get('/track-booking', [BookingController::class, 'trackPage'])->name('booking.track');
Route::post('/track-booking', [BookingController::class, 'trackLookup'])->name('booking.track.lookup');
