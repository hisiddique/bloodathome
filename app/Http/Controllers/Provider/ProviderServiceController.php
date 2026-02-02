<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Http\Requests\Provider\ProviderServiceRequest;
use App\Models\ProviderService;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProviderServiceController extends Controller
{
    public function index(): Response
    {
        $provider = auth()->user()->provider;

        $providerServices = $provider->providerServices()
            ->with(['service.category', 'status'])
            ->latest()
            ->get();

        $availableServices = Service::query()
            ->active()
            ->with('category')
            ->whereNotIn('id', $providerServices->pluck('service_id'))
            ->orderBy('service_name')
            ->get();

        return Inertia::render('provider/services/index', [
            'providerServices' => $providerServices,
            'availableServices' => $availableServices,
        ]);
    }

    public function store(ProviderServiceRequest $request): RedirectResponse
    {
        $provider = auth()->user()->provider;

        $provider->providerServices()->create($request->validated());

        return back()->with('success', 'Service added successfully.');
    }

    public function update(ProviderServiceRequest $request, ProviderService $providerService): RedirectResponse
    {
        $provider = auth()->user()->provider;

        if ($providerService->provider_id !== $provider->id) {
            abort(403, 'Unauthorized action.');
        }

        $providerService->update($request->validated());

        return back()->with('success', 'Service updated successfully.');
    }

    public function destroy(ProviderService $providerService): RedirectResponse
    {
        $provider = auth()->user()->provider;

        if ($providerService->provider_id !== $provider->id) {
            abort(403, 'Unauthorized action.');
        }

        $providerService->delete();

        return back()->with('success', 'Service removed successfully.');
    }
}
