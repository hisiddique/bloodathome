<?php

use App\Http\Controllers\Auth\EmailVerificationOtpController;
use App\Http\Controllers\Auth\PendingRegistrationController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\BookingDispatchController;
use App\Http\Controllers\ChatDispatchController;
use App\Http\Controllers\ChatMessageController;
use App\Http\Controllers\ClinicLocationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Patient\PatientAddressController;
use App\Http\Controllers\Patient\PatientBookingController;
use App\Http\Controllers\Patient\PatientDependentController;
use App\Http\Controllers\Patient\PatientMedicalInfoController;
use App\Http\Controllers\Patient\PatientPaymentMethodController;
use App\Http\Controllers\Patient\PatientReviewController;
use App\Http\Controllers\ProfileDispatchController;
use App\Http\Controllers\Provider\ProviderAvailabilityController;
use App\Http\Controllers\Provider\ProviderBookingController;
use App\Http\Controllers\Provider\ProviderEarningsController;
use App\Http\Controllers\Provider\ProviderProfileController;
use App\Http\Controllers\Provider\ProviderServiceAreaController;
use App\Http\Controllers\Provider\ProviderServiceController;
use App\Http\Controllers\Provider\ProviderSettlementController;
use App\Http\Controllers\ProviderRegistrationController;
use App\Http\Controllers\ServiceController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('index', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Public routes
Route::get('/faq', fn () => Inertia::render('faq'))->name('faq');
Route::redirect('/search', '/book')->name('search.index');
Route::get('/become-phlebotomist', [ProviderRegistrationController::class, 'create'])->name('phlebotomist.register');
Route::post('/become-phlebotomist', [ProviderRegistrationController::class, 'store'])->name('phlebotomist.store');
Route::get('/become-phlebotomist/complete', [ProviderRegistrationController::class, 'complete'])->middleware('auth')->name('phlebotomist.register.complete');
Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
Route::get('/clinics', [ClinicLocationController::class, 'index'])->name('clinics.index');
Route::get('/clinics/{clinicLocation}', [ClinicLocationController::class, 'show'])->name('clinics.show');

// Pending registration routes (before OTP verification)
Route::middleware('guest')->group(function () {
    Route::post('/register', [PendingRegistrationController::class, 'store'])->name('register.store');
    Route::get('/email/verify-pending', [PendingRegistrationController::class, 'showVerification'])->name('verification.pending');
    Route::post('/email/verify-pending-otp', [PendingRegistrationController::class, 'verifyOtp'])
        ->middleware('throttle:10,1')
        ->name('verification.pending.verify');
    Route::post('/email/resend-pending-otp', [PendingRegistrationController::class, 'resendOtp'])
        ->middleware('throttle:3,15')
        ->name('verification.pending.resend');
});

// Email verification OTP routes (authenticated users)
Route::middleware('auth')->group(function () {
    Route::post('/email/send-otp', [EmailVerificationOtpController::class, 'sendOtp'])
        ->middleware('throttle:3,15')
        ->name('verification.send-otp');
    Route::post('/email/verify-otp', [EmailVerificationOtpController::class, 'verifyOtp'])
        ->name('verification.verify-otp');
});

// Booking routes
Route::get('/book', [BookingController::class, 'wizard'])->name('booking.wizard');
Route::post('/booking', [BookingController::class, 'store'])->middleware('auth')->name('booking.store');

// Booking API routes (in web.php for session-based auth detection)
Route::prefix('api')->group(function () {
    Route::post('booking-drafts', [\App\Http\Controllers\Api\BookingApiController::class, 'createDraft'])
        ->middleware('throttle:10,1');
    Route::post('booking-drafts/payment-intent', [\App\Http\Controllers\Api\BookingApiController::class, 'createPaymentIntent'])
        ->middleware('throttle:10,1');
    Route::post('bookings/confirm', [\App\Http\Controllers\Api\BookingApiController::class, 'confirmBooking'])
        ->middleware('throttle:10,1');

    // Authenticated booking endpoints
    Route::middleware('auth')->group(function () {
        Route::patch('booking-drafts/{booking}', [\App\Http\Controllers\Api\BookingApiController::class, 'updateDraft']);
        Route::post('booking-drafts/{booking}/promo-code', [\App\Http\Controllers\Api\BookingApiController::class, 'applyPromoCode']);
        Route::post('addresses', [\App\Http\Controllers\Api\BookingApiController::class, 'saveAddress']);
        Route::post('dependents', [\App\Http\Controllers\Api\BookingApiController::class, 'storeDependent']);
        Route::patch('nhs-number', [\App\Http\Controllers\Api\BookingApiController::class, 'saveNhsNumber']);
        Route::patch('dependents/{dependent}/nhs-number', [\App\Http\Controllers\Api\BookingApiController::class, 'saveDependentNhsNumber']);
    });
});

// Authenticated routes
Route::middleware(['auth', 'verified'])->group(function () {
    // Shared routes (dispatched based on role)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/bookings', [BookingDispatchController::class, 'index'])->name('bookings.index');
    Route::get('/bookings/{booking}', [BookingDispatchController::class, 'show'])->name('bookings.show');
    Route::get('/profile', [ProfileDispatchController::class, 'edit'])->name('my-profile.edit');
    Route::patch('/profile', [ProfileDispatchController::class, 'update'])->name('my-profile.update');
    Route::get('/chat', [ChatDispatchController::class, 'index'])->name('chat.index');
    Route::get('/chat/{booking}', [ChatDispatchController::class, 'show'])->name('chat.show');
    Route::post('/chat/{booking}', [ChatDispatchController::class, 'store'])->name('chat.store');
    Route::get('/chat/{booking}/messages', [ChatDispatchController::class, 'messages'])->name('chat.messages');

    // Legacy booking routes
    Route::get('/my-bookings', [BookingController::class, 'index'])->name('my-bookings.index');
    Route::get('/my-bookings/{booking}', [BookingController::class, 'show'])->name('my-bookings.show');
    Route::delete('/my-bookings/{booking}', [BookingController::class, 'cancel'])->name('my-bookings.cancel');
    Route::get('/api/bookings/{booking}/messages', [ChatMessageController::class, 'index']);
    Route::post('/api/bookings/{booking}/messages', [ChatMessageController::class, 'store']);

    // Patient-only routes
    Route::middleware('role:patient')->name('patient.')->group(function () {
        Route::patch('/bookings/{booking}/cancel', [PatientBookingController::class, 'cancel'])->name('bookings.cancel');
        Route::post('/bookings/{booking}/review', [PatientReviewController::class, 'store'])->name('reviews.store');

        Route::get('/addresses', [PatientAddressController::class, 'index'])->name('addresses.index');
        Route::get('/addresses/create', [PatientAddressController::class, 'create'])->name('addresses.create');
        Route::post('/addresses', [PatientAddressController::class, 'store'])->name('addresses.store');
        Route::get('/addresses/{address}/edit', [PatientAddressController::class, 'edit'])->name('addresses.edit');
        Route::patch('/addresses/{address}', [PatientAddressController::class, 'update'])->name('addresses.update');
        Route::delete('/addresses/{address}', [PatientAddressController::class, 'destroy'])->name('addresses.destroy');
        Route::patch('/addresses/{address}/default', [PatientAddressController::class, 'setDefault'])->name('addresses.default');

        Route::get('/payment-methods', [PatientPaymentMethodController::class, 'index'])->name('payment-methods.index');
        Route::get('/payment-methods/create', [PatientPaymentMethodController::class, 'create'])->name('payment-methods.create');
        Route::get('/payment-methods/setup-complete', [PatientPaymentMethodController::class, 'setupComplete'])->name('payment-methods.setup-complete');
        Route::delete('/payment-methods/{paymentMethod}', [PatientPaymentMethodController::class, 'destroy'])->name('payment-methods.destroy');
        Route::patch('/payment-methods/{paymentMethod}/default', [PatientPaymentMethodController::class, 'setDefault'])->name('payment-methods.default');

        Route::get('/medical-info', [PatientMedicalInfoController::class, 'edit'])->name('medical-info.edit');
        Route::patch('/medical-info', [PatientMedicalInfoController::class, 'update'])->name('medical-info.update');

        Route::resource('dependents', PatientDependentController::class)->except(['show']);
    });

    // Provider-only routes
    Route::middleware('role:provider')->name('provider.')->group(function () {
        Route::patch('/bookings/{booking}/accept', [ProviderBookingController::class, 'accept'])->name('bookings.accept');
        Route::patch('/bookings/{booking}/decline', [ProviderBookingController::class, 'decline'])->name('bookings.decline');
        Route::patch('/bookings/{booking}/complete', [ProviderBookingController::class, 'complete'])->name('bookings.complete');

        Route::post('/profile/photo', [ProviderProfileController::class, 'updatePhoto'])->name('profile.photo');

        Route::get('/services', [ProviderServiceController::class, 'index'])->name('services.index');
        Route::post('/services', [ProviderServiceController::class, 'store'])->name('services.store');
        Route::patch('/services/{providerService}', [ProviderServiceController::class, 'update'])->name('services.update');
        Route::delete('/services/{providerService}', [ProviderServiceController::class, 'destroy'])->name('services.destroy');

        Route::get('/availability', [ProviderAvailabilityController::class, 'index'])->name('availability.index');
        Route::post('/availability', [ProviderAvailabilityController::class, 'store'])->name('availability.store');
        Route::delete('/availability/{availability}', [ProviderAvailabilityController::class, 'destroy'])->name('availability.destroy');

        Route::get('/service-areas', [ProviderServiceAreaController::class, 'index'])->name('service-areas.index');
        Route::post('/service-areas', [ProviderServiceAreaController::class, 'store'])->name('service-areas.store');
        Route::delete('/service-areas/{serviceArea}', [ProviderServiceAreaController::class, 'destroy'])->name('service-areas.destroy');

        Route::get('/earnings', [ProviderEarningsController::class, 'index'])->name('earnings.index');
        Route::get('/settlements', [ProviderSettlementController::class, 'index'])->name('settlements.index');
    });
});

require __DIR__.'/settings.php';
