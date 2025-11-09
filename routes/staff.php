<?php

use App\Http\Controllers\Staff\AssignedStaffController;
use App\Http\Controllers\Staff\StaffController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {

    Route::prefix('staff')->group(function () {
        Route::get('/', [StaffController::class, 'index'])->name('staff.index');
        Route::get('index2', [StaffController::class, 'index2']);
        Route::get('create', [StaffController::class, 'create'])->name('staff.create');
        Route::post('store', [StaffController::class, 'store'])->name('staff.store');
        Route::get('{id}/show', [StaffController::class, 'show'])->name('staff.show');
        Route::get('{id}/edit', [StaffController::class, 'edit'])->name('staff.edit');
        Route::put('{id}/update', [StaffController::class, 'update'])->name('staff.update');
        Route::delete('{id}/destroy', [StaffController::class, 'destroy'])->name('staff.destroy');
        Route::put('{id}/updateStatus', [StaffController::class, 'updateStatus'])->name('staff.updateStatus');
    });

    Route::prefix('assigned-staff')->group(function () {
        Route::get('/', [AssignedStaffController::class, 'index'])->name('assignedstaff.index');
        Route::get('create', [AssignedStaffController::class, 'create'])->name('assignedstaff.create');
        Route::post('store', [AssignedStaffController::class, 'store'])->name('assignedstaff.store');
        Route::get('{id}/show', [AssignedStaffController::class, 'show'])->name('assignedstaff.show');
        Route::get('{id}/edit', [AssignedStaffController::class, 'edit'])->name('assignedstaff.edit');
        Route::put('{id}/update', [AssignedStaffController::class, 'update'])->name('assignedstaff.update');
        Route::delete('{id}/destroy', [AssignedStaffController::class, 'destroy'])->name('assignedstaff.destroy');
    });

    Route::prefix('staff-availability')->group(function () {
        Route::get('{staff_id}/edit', [\App\Http\Controllers\Staff\StaffAvailabilityController::class, 'edit'])->name('staffavailability.edit');
        Route::put('{staff_id}/update', [\App\Http\Controllers\Staff\StaffAvailabilityController::class, 'update'])->name('staffavailability.update');
    });

});
