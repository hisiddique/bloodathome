<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Patient\PatientProfileController;
use App\Http\Controllers\Provider\ProviderProfileController;
use Illuminate\Http\Request;

class ProfileDispatchController extends Controller
{
    public function edit(Request $request): mixed
    {
        return $request->user()->isProvider()
            ? app(ProviderProfileController::class)->edit()
            : app(PatientProfileController::class)->edit($request);
    }

    public function update(Request $request): mixed
    {
        return $request->user()->isProvider()
            ? app()->call([app(ProviderProfileController::class), 'update'])
            : app()->call([app(PatientProfileController::class), 'update']);
    }
}
