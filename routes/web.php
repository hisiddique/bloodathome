<?php

use App\Http\Controllers\BloodTestController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ChatMessageController;
use App\Http\Controllers\LabController;
use App\Http\Controllers\PhlebotomistController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('index', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Public routes
Route::get('/faq', fn() => Inertia::render('faq'))->name('faq');
Route::get('/search', [PhlebotomistController::class, 'search'])->name('search.index');
Route::get('/search/results', [PhlebotomistController::class, 'results'])->name('search.results');
Route::get('/phlebotomist/{phlebotomist}', [PhlebotomistController::class, 'show'])->name('phlebotomist.show');
Route::get('/become-phlebotomist', fn() => Inertia::render('become-phlebotomist'))->name('phlebotomist.register');
Route::post('/become-phlebotomist', [PhlebotomistController::class, 'register'])->name('phlebotomist.store');
Route::get('/blood-tests', [BloodTestController::class, 'index'])->name('blood-tests.index');
Route::get('/labs', [LabController::class, 'index'])->name('labs.index');
Route::get('/labs/{lab}', [LabController::class, 'show'])->name('labs.show');

// Booking routes
Route::get('/booking', [BookingController::class, 'create'])->name('booking.create');
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
