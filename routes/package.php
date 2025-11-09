<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\Package\PackagesController;
use App\Http\Controllers\Package\ServicesController;
use App\Http\Controllers\Package\EditServicesController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {

    Route::prefix('package')->group(function () {
        Route::get('/', [PackagesController::class, 'index'])->name('package.index');
        Route::get('create', [PackagesController::class, 'create'])->name('package.create');
        Route::post('store', [PackagesController::class, 'store'])->name('package.store');
        Route::get('{id}/show', [PackagesController::class, 'show'])->name('package.show');
        Route::put('{id}/update-status', [PackagesController::class, 'updateStatus'])->name('package.updateStatus');
        Route::delete('{id}/destroy', [PackagesController::class, 'destroy'])->name('package.destroy');
        Route::get('{id}/show-services', [PackagesController::class, 'showServices'])->name('package.showServices');
        Route::post('save', [PackagesController::class, 'save'])->name('package.save');
    });

    Route::prefix('services')->group(function () {
        Route::get('create', [ServicesController::class, 'create'])->name('service.create');
        Route::post('store', [ServicesController::class, 'store'])->name('service.store');
        Route::post('remove', [ServicesController::class, 'remove'])->name('service.remove');
        Route::delete('{id}/destroy-service', [ServicesController::class, 'destroy'])->name('service.destroy');
    });

    Route::prefix('package')->group(function () {
        Route::get('{id}/services', [ServicesController::class, 'editPackageServices'])->name('service.editPackageServices');
        Route::get('{id}/edit', [PackagesController::class, 'edit'])->name('package.edit');
        Route::put('{id}/update', [PackagesController::class, 'update'])->name('package.update');
        Route::post('{id}/services', [EditServicesController::class, 'store'])->name('package.services.store');
        Route::delete('{packageId}/services/{serviceId}', [EditServicesController::class, 'destroy'])->name('package.services.destroy');
        Route::put('services/{id}', [EditServicesController::class, 'update'])->name('package.services.update');
    });

});
