<?php

use App\Http\Controllers\Messages\AdminMessagesController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {

    Route::prefix('messages')->group(function () {
        Route::get('/', [AdminMessagesController::class, 'index'])->name('messages.index');
        Route::get('create', [AdminMessagesController::class, 'create'])->name('messages.create');
        Route::post('store', [AdminMessagesController::class, 'store'])->name('messages.store');
        Route::delete('{id}/destroy', [AdminMessagesController::class, 'destroy'])->name('messages.destroy');

    });
});

Route::post('messages/public/store', [AdminMessagesController::class, 'publicStore'])->name('messages.public.store');

