<?php

namespace App\Http\Controllers;

use App\Models\ClinicLocation;
use Inertia\Inertia;
use Inertia\Response;

class ClinicLocationController extends Controller
{
    /**
     * Display a listing of all active clinic locations.
     */
    public function index(): Response
    {
        $clinicLocations = ClinicLocation::query()
            ->with('provider.type')
            ->active()
            ->orderBy('name')
            ->paginate(20);

        return Inertia::render('clinics/index', [
            'clinicLocations' => $clinicLocations,
        ]);
    }

    /**
     * Display a single clinic location.
     */
    public function show(ClinicLocation $clinicLocation): Response
    {
        $clinicLocation->load([
            'provider' => function ($query) {
                $query->with(['type', 'status', 'providerServices.service']);
            },
        ]);

        return Inertia::render('clinics/show', [
            'clinicLocation' => $clinicLocation,
        ]);
    }
}
