<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Shared\Appointments;
use App\Http\Controllers\Shared\EventsController;
use App\Http\Controllers\Shared\ServiceController;

Route::middleware('auth')->group(function () {

    Route::prefix('shared-events')->group(function () {
        Route::get('/', [EventsController::class, 'index'])->name('events.index');
        Route::get('create', [EventsController::class, 'create'])->name('events.create');
        Route::post('store', [EventsController::class, 'store'])->name('events.store');
        Route::delete('{id}/destroy', [EventsController::class, 'destroy'])->name('events.destroy');
    });

    Route::prefix('shared-service')->group(function () {
        Route::get('/', [ServiceController::class, 'index'])->name('sharedservice.index');
        Route::get('create', [ServiceController::class, 'create'])->name('sharedservice.create');
        Route::post('store', [ServiceController::class, 'store'])->name('sharedservice.store');
        Route::delete('{id}/destroy', [ServiceController::class, 'destroy'])->name('sharedservice.destroy');
    });

    Route::prefix('shared-appointments')->group(function () {
        Route::get('/', [Appointments::class, 'index'])->name('sharedappointments.index');
        Route::get('create', [Appointments::class, 'create'])->name('sharedappointments.create');
        Route::post('store', [Appointments::class, 'store'])->name('sharedappointments.store');
        Route::delete('{id}/destroy', [Appointments::class, 'destroy'])->name('sharedappointments.destroy');
    });
});
