<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Patient\PatientBookingController;
use App\Http\Controllers\Provider\ProviderBookingController;
use App\Models\Booking;
use Illuminate\Http\Request;

class BookingDispatchController extends Controller
{
    public function index(Request $request): mixed
    {
        return $request->user()->isProvider()
            ? app(ProviderBookingController::class)->index($request)
            : app(PatientBookingController::class)->index($request);
    }

    public function show(Request $request, Booking $booking): mixed
    {
        return $request->user()->isProvider()
            ? app(ProviderBookingController::class)->show($booking)
            : app(PatientBookingController::class)->show($request, $booking);
    }
}
