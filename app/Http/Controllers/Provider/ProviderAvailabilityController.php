<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Http\Requests\Provider\ProviderAvailabilityRequest;
use App\Models\ProviderAvailability;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProviderAvailabilityController extends Controller
{
    public function index(): Response
    {
        $provider = auth()->user()->provider;

        $recurringAvailability = $provider->availabilities()
            ->recurring()
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();

        $specificDateAvailability = $provider->availabilities()
            ->specificDate()
            ->where('specific_date', '>=', now()->toDateString())
            ->orderBy('specific_date')
            ->orderBy('start_time')
            ->get();

        return Inertia::render('provider/availability/index', [
            'recurringAvailability' => $recurringAvailability,
            'specificDateAvailability' => $specificDateAvailability,
        ]);
    }

    public function store(ProviderAvailabilityRequest $request): RedirectResponse
    {
        $provider = auth()->user()->provider;

        $provider->availabilities()->create($request->validated());

        return back()->with('success', 'Availability added successfully.');
    }

    public function destroy(ProviderAvailability $availability): RedirectResponse
    {
        $provider = auth()->user()->provider;

        if ($availability->provider_id !== $provider->id) {
            abort(403, 'Unauthorized action.');
        }

        $availability->delete();

        return back()->with('success', 'Availability removed successfully.');
    }
}
