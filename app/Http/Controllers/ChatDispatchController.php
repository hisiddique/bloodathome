<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Patient\PatientChatController;
use App\Http\Controllers\Provider\ProviderChatController;
use App\Models\Booking;
use Illuminate\Http\Request;

class ChatDispatchController extends Controller
{
    public function index(Request $request): mixed
    {
        return $request->user()->isProvider()
            ? app(ProviderChatController::class)->index()
            : app(PatientChatController::class)->index($request);
    }

    public function show(Request $request, Booking $booking): mixed
    {
        return $request->user()->isProvider()
            ? app(ProviderChatController::class)->show($booking)
            : app(PatientChatController::class)->show($request, $booking);
    }

    public function store(Request $request, Booking $booking): mixed
    {
        return $request->user()->isProvider()
            ? app()->call([app(ProviderChatController::class), 'store'], ['booking' => $booking])
            : app()->call([app(PatientChatController::class), 'store'], ['booking' => $booking]);
    }

    public function messages(Request $request, Booking $booking): mixed
    {
        return $request->user()->isProvider()
            ? app(ProviderChatController::class)->messages($booking)
            : app(PatientChatController::class)->messages($request, $booking);
    }
}
