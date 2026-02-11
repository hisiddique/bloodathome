<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Patient\PatientDashboardController;
use App\Http\Controllers\Provider\ProviderDashboardController;
use Illuminate\Http\Request;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        return $request->user()->isProvider()
            ? app(ProviderDashboardController::class)->index()
            : app(PatientDashboardController::class)->index($request);
    }
}
