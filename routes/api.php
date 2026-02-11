<?php

use App\Http\Controllers\Api\BookingApiController;
use App\Http\Controllers\Api\StripeWebhookController;
use Illuminate\Support\Facades\Route;

/**
 * API Routes
 *
 * Public and authenticated API endpoints for the BloodAtHome application
 */

// Public booking API endpoints (frontend expects these at /api/*)
Route::get('services', [BookingApiController::class, 'getServices']);
Route::get('collection-types', [BookingApiController::class, 'getCollectionTypes']);
Route::post('providers/search', [BookingApiController::class, 'searchProviders']);
Route::get('providers/{provider}/availability', [BookingApiController::class, 'getProviderAvailability']);

// Booking draft creation (public - supports both auth and guest)
Route::post('booking-drafts', [BookingApiController::class, 'createDraft']);

// Payment endpoints (public - supports both auth and guest, rate limited)
Route::middleware('throttle:10,1')->group(function () {
    Route::post('booking-drafts/payment-intent', [BookingApiController::class, 'createPaymentIntent']);
    Route::post('bookings/confirm', [BookingApiController::class, 'confirmBooking']);
});

// Authenticated booking endpoints
Route::middleware('auth')->group(function () {
    Route::patch('booking-drafts/{booking}', [BookingApiController::class, 'updateDraft']);
    Route::post('booking-drafts/{booking}/promo-code', [BookingApiController::class, 'applyPromoCode']);
    Route::post('addresses', [BookingApiController::class, 'saveAddress']);
});

// Booking API v1 (backward compatibility - aliases to above routes)
Route::prefix('v1/booking')->group(function () {
    // Public endpoints
    Route::get('services', [BookingApiController::class, 'getServices']);
    Route::get('collection-types', [BookingApiController::class, 'getCollectionTypes']);
    Route::post('providers/search', [BookingApiController::class, 'searchProviders']);
    Route::get('providers/{provider}/availability', [BookingApiController::class, 'getProviderAvailability']);

    // Authenticated endpoints
    Route::middleware('auth')->group(function () {
        Route::post('draft', [BookingApiController::class, 'createDraft']);

        // Payment endpoints with stricter rate limiting
        Route::middleware('throttle:10,1')->group(function () {
            Route::post('payment-intent', [BookingApiController::class, 'createPaymentIntent']);
            Route::post('confirm', [BookingApiController::class, 'confirmBooking']);
        });
    });
});

// Stripe webhook (no auth - verified by signature)
Route::post('v1/stripe/webhook', [StripeWebhookController::class, 'handle'])
    ->name('stripe.webhook');
