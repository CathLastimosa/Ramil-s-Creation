<?php

use App\Http\Controllers\Feedback\FeedbackController;
use App\Http\Controllers\Feedback\AdminFeedbackController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::prefix('admin-feedback')->group(function () {
        Route::get('', [AdminFeedbackController::class, 'index'])->name('feedbacks.index');
        Route::delete('{id}', [AdminFeedbackController::class, 'destroy'])->name('feedbacks.destroy');
    });
});

Route::prefix('send-feedback')->group(function () {
    Route::get('{booking}/create', [FeedbackController::class, 'create'])->name('feedbacks.create');
    Route::post('store', [FeedbackController::class, 'store'])->name('feedbacks.store');
});
