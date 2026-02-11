<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProviderRegistrationRequest;
use App\Models\Provider;
use Illuminate\Http\RedirectResponse;
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
