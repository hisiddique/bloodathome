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

// Booking draft, payment-intent, and confirm routes are in web.php
// for session-based auth detection (Inertia uses web middleware)

// Authenticated booking endpoints moved to web.php for session-based auth

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
