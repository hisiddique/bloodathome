<?php

use App\Http\Controllers\BookingController;
use App\Http\Controllers\ChatMessageController;
use App\Http\Controllers\ClinicLocationController;
use App\Http\Controllers\ProviderController;
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
Route::get('/search', [ProviderController::class, 'search'])->name('search.index');
Route::get('/search/results', [ProviderController::class, 'results'])->name('search.results');
Route::get('/provider/{provider}', [ProviderController::class, 'show'])->name('provider.show');
Route::get('/become-phlebotomist', fn () => Inertia::render('become-phlebotomist'))->name('phlebotomist.register');
Route::post('/become-phlebotomist', [ProviderController::class, 'register'])->name('phlebotomist.store');
Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
Route::get('/clinics', [ClinicLocationController::class, 'index'])->name('clinics.index');
Route::get('/clinics/{clinicLocation}', [ClinicLocationController::class, 'show'])->name('clinics.show');

// Booking routes
Route::get('/booking', [BookingController::class, 'create'])->name('booking.create');
Route::get('/book', [BookingController::class, 'wizard'])->name('booking.wizard');
Route::post('/booking', [BookingController::class, 'store'])->middleware('auth')->name('booking.store');

// Authenticated routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/my-bookings', [BookingController::class, 'index'])->name('bookings.index');
    Route::get('/my-bookings/{booking}', [BookingController::class, 'show'])->name('bookings.show');
    Route::delete('/my-bookings/{booking}', [BookingController::class, 'cancel'])->name('bookings.cancel');
    Route::get('/api/bookings/{booking}/messages', [ChatMessageController::class, 'index']);
    Route::post('/api/bookings/{booking}/messages', [ChatMessageController::class, 'store']);
});

require __DIR__.'/settings.php';
