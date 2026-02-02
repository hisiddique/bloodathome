<?php

use App\Http\Controllers\Provider\ProviderAvailabilityController;
use App\Http\Controllers\Provider\ProviderBookingController;
use App\Http\Controllers\Provider\ProviderChatController;
use App\Http\Controllers\Provider\ProviderDashboardController;
use App\Http\Controllers\Provider\ProviderEarningsController;
use App\Http\Controllers\Provider\ProviderProfileController;
use App\Http\Controllers\Provider\ProviderServiceAreaController;
use App\Http\Controllers\Provider\ProviderServiceController;
use App\Http\Controllers\Provider\ProviderSettlementController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:provider'])
    ->prefix('provider')
    ->name('provider.')
    ->group(function () {
        // Dashboard
        Route::get('/dashboard', [ProviderDashboardController::class, 'index'])->name('dashboard');

        // Profile
        Route::get('/profile', [ProviderProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProviderProfileController::class, 'update'])->name('profile.update');
        Route::post('/profile/photo', [ProviderProfileController::class, 'updatePhoto'])->name('profile.photo');

        // Services & Pricing
        Route::get('/services', [ProviderServiceController::class, 'index'])->name('services.index');
        Route::post('/services', [ProviderServiceController::class, 'store'])->name('services.store');
        Route::patch('/services/{providerService}', [ProviderServiceController::class, 'update'])->name('services.update');
        Route::delete('/services/{providerService}', [ProviderServiceController::class, 'destroy'])->name('services.destroy');

        // Availability
        Route::get('/availability', [ProviderAvailabilityController::class, 'index'])->name('availability.index');
        Route::post('/availability', [ProviderAvailabilityController::class, 'store'])->name('availability.store');
        Route::delete('/availability/{availability}', [ProviderAvailabilityController::class, 'destroy'])->name('availability.destroy');

        // Service Areas
        Route::get('/service-areas', [ProviderServiceAreaController::class, 'index'])->name('service-areas.index');
        Route::post('/service-areas', [ProviderServiceAreaController::class, 'store'])->name('service-areas.store');
        Route::delete('/service-areas/{serviceArea}', [ProviderServiceAreaController::class, 'destroy'])->name('service-areas.destroy');

        // Bookings
        Route::get('/bookings', [ProviderBookingController::class, 'index'])->name('bookings.index');
        Route::get('/bookings/{booking}', [ProviderBookingController::class, 'show'])->name('bookings.show');
        Route::patch('/bookings/{booking}/accept', [ProviderBookingController::class, 'accept'])->name('bookings.accept');
        Route::patch('/bookings/{booking}/decline', [ProviderBookingController::class, 'decline'])->name('bookings.decline');
        Route::patch('/bookings/{booking}/complete', [ProviderBookingController::class, 'complete'])->name('bookings.complete');

        // Earnings
        Route::get('/earnings', [ProviderEarningsController::class, 'index'])->name('earnings.index');
        Route::get('/settlements', [ProviderSettlementController::class, 'index'])->name('settlements.index');

        // Chat (polling-based)
        Route::get('/chat', [ProviderChatController::class, 'index'])->name('chat.index');
        Route::get('/chat/{booking}', [ProviderChatController::class, 'show'])->name('chat.show');
        Route::post('/chat/{booking}', [ProviderChatController::class, 'store'])->name('chat.store');
        Route::get('/chat/{booking}/messages', [ProviderChatController::class, 'messages'])->name('chat.messages');
    });
