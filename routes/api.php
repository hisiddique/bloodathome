<?php

use App\Http\Controllers\Api\BookingApiController;
use App\Http\Controllers\Api\StripeWebhookController;
use Illuminate\Support\Facades\Route;

/**
 * API Routes
 *
 * Public and authenticated API endpoints for the BloodAtHome application
 */

// Booking API v1
Route::prefix('v1/booking')->group(function () {
    // Public endpoints
    Route::get('services', [BookingApiController::class, 'getServices']);
    Route::post('providers/search', [BookingApiController::class, 'searchProviders']);
    Route::get('providers/{provider}/availability', [BookingApiController::class, 'getProviderAvailability']);

    // Authenticated endpoints
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('draft', [BookingApiController::class, 'createDraft']);
        Route::post('payment-intent', [BookingApiController::class, 'createPaymentIntent']);
        Route::post('confirm', [BookingApiController::class, 'confirmBooking']);
    });
});

// Stripe webhook (no auth - verified by signature)
Route::post('v1/stripe/webhook', [StripeWebhookController::class, 'handle'])
    ->name('stripe.webhook');
