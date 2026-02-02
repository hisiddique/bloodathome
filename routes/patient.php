<?php

use App\Http\Controllers\Patient\PatientAddressController;
use App\Http\Controllers\Patient\PatientBookingController;
use App\Http\Controllers\Patient\PatientChatController;
use App\Http\Controllers\Patient\PatientDashboardController;
use App\Http\Controllers\Patient\PatientMedicalInfoController;
use App\Http\Controllers\Patient\PatientPaymentMethodController;
use App\Http\Controllers\Patient\PatientProfileController;
use App\Http\Controllers\Patient\PatientReviewController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:patient'])
    ->prefix('patient')
    ->name('patient.')
    ->group(function () {
        // Dashboard
        Route::get('/dashboard', [PatientDashboardController::class, 'index'])->name('dashboard');

        // Bookings
        Route::get('/bookings', [PatientBookingController::class, 'index'])->name('bookings.index');
        Route::get('/bookings/{booking}', [PatientBookingController::class, 'show'])->name('bookings.show');
        Route::patch('/bookings/{booking}/cancel', [PatientBookingController::class, 'cancel'])->name('bookings.cancel');

        // Profile & Medical Info
        Route::get('/profile', [PatientProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [PatientProfileController::class, 'update'])->name('profile.update');
        Route::get('/medical-info', [PatientMedicalInfoController::class, 'edit'])->name('medical-info.edit');
        Route::patch('/medical-info', [PatientMedicalInfoController::class, 'update'])->name('medical-info.update');

        // Addresses
        Route::get('/addresses', [PatientAddressController::class, 'index'])->name('addresses.index');
        Route::post('/addresses', [PatientAddressController::class, 'store'])->name('addresses.store');
        Route::patch('/addresses/{address}', [PatientAddressController::class, 'update'])->name('addresses.update');
        Route::delete('/addresses/{address}', [PatientAddressController::class, 'destroy'])->name('addresses.destroy');
        Route::patch('/addresses/{address}/default', [PatientAddressController::class, 'setDefault'])->name('addresses.default');

        // Payment Methods
        Route::get('/payment-methods', [PatientPaymentMethodController::class, 'index'])->name('payment-methods.index');
        Route::post('/payment-methods', [PatientPaymentMethodController::class, 'store'])->name('payment-methods.store');
        Route::delete('/payment-methods/{paymentMethod}', [PatientPaymentMethodController::class, 'destroy'])->name('payment-methods.destroy');
        Route::patch('/payment-methods/{paymentMethod}/default', [PatientPaymentMethodController::class, 'setDefault'])->name('payment-methods.default');

        // Chat
        Route::get('/chat', [PatientChatController::class, 'index'])->name('chat.index');
        Route::get('/chat/{booking}', [PatientChatController::class, 'show'])->name('chat.show');
        Route::post('/chat/{booking}', [PatientChatController::class, 'store'])->name('chat.store');
        Route::get('/chat/{booking}/messages', [PatientChatController::class, 'messages'])->name('chat.messages');

        // Reviews
        Route::post('/bookings/{booking}/review', [PatientReviewController::class, 'store'])->name('reviews.store');
    });
