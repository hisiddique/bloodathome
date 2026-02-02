<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProviderRegistrationRequest;
use App\Models\Provider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProviderController extends Controller
{
    /**
     * Display the provider search page.
     */
    public function search(): Response
    {
        return Inertia::render('search/index');
    }

    /**
     * Display search results for providers.
     */
    public function results(Request $request): Response
    {
        $query = Provider::query()
            ->with(['type', 'status', 'providerServices.service']);

        // Filter by location if provided
        // Note: Location-based search is planned for a future release
        if ($request->filled('postcode') || $request->filled('location')) {
            // Placeholder for future location-based filtering
        }

        // Filter by service if provided
        if ($request->filled('service_id')) {
            $query->whereHas('providerServices', function ($q) use ($request) {
                $q->where('service_id', $request->input('service_id'));
            });
        }

        // Only show approved and active providers
        $query->whereHas('status', function ($q) {
            $q->where('status_name', 'Approved');
        });

        // Order by rating
        $providers = $query->orderByDesc('average_rating')
            ->orderByDesc('total_reviews')
            ->paginate(12);

        return Inertia::render('search/results', [
            'providers' => $providers,
            'filters' => $request->only(['postcode', 'location', 'service_id']),
        ]);
    }

    /**
     * Display a single provider profile.
     */
    public function show(Provider $provider): Response
    {
        $provider->load([
            'type',
            'status',
            'providerServices.service',
            'availabilities',
            'serviceAreas',
            'qualifications',
            'clinicLocations' => function ($query) {
                $query->active();
            },
            'reviews' => function ($query) {
                $query->latest()->limit(10);
            },
        ]);

        return Inertia::render('provider/show', [
            'provider' => $provider,
        ]);
    }

    /**
     * Handle provider registration.
     */
    public function register(ProviderRegistrationRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // Note: Provider registration is handled via admin panel approval workflow
        // Future enhancement: Add self-service registration with Fortify integration

        return redirect()->route('home')->with('success', 'Your application has been submitted. We will review and contact you soon.');
    }
}
