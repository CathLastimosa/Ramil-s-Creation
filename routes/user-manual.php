<?php

use App\Http\Controllers\Manual\UserManualController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {

    Route::prefix('user-manual')->group(function () {
        Route::get('/', [UserManualController::class, 'index'])->name('user-manual.index');
    });
});
