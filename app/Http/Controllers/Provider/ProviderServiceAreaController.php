<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Http\Requests\Provider\ProviderServiceAreaRequest;
use App\Models\ProviderServiceArea;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProviderServiceAreaController extends Controller
{
    public function index(): Response
    {
        $provider = auth()->user()->provider;

        $serviceAreas = $provider->serviceAreas()
            ->orderBy('postcode_prefix')
            ->get();

        return Inertia::render('provider/service-areas/index', [
            'serviceAreas' => $serviceAreas,
        ]);
    }

    public function store(ProviderServiceAreaRequest $request): RedirectResponse
    {
        $provider = auth()->user()->provider;

        $provider->serviceAreas()->create($request->validated());

        return back()->with('success', 'Service area added successfully.');
    }

    public function destroy(ProviderServiceArea $serviceArea): RedirectResponse
    {
        $provider = auth()->user()->provider;

        if ($serviceArea->provider_id !== $provider->id) {
            abort(403, 'Unauthorized action.');
        }

        $serviceArea->delete();

        return back()->with('success', 'Service area removed successfully.');
    }
}
