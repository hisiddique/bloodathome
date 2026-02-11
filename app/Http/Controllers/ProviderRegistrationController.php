<?php

namespace App\Http\Controllers;

use App\Actions\Fortify\CreateNewProvider;
use App\Models\ProviderType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProviderRegistrationController extends Controller
{
    /**
     * Display the provider registration form.
     */
    public function create(): Response
    {
        $providerTypes = ProviderType::all(['id', 'name', 'description']);

        return Inertia::render('auth/provider-register', [
            'providerTypes' => $providerTypes,
        ]);
    }

    /**
     * Handle provider registration.
     */
    public function store(Request $request, CreateNewProvider $creator): RedirectResponse
    {
        $user = $creator->create($request->all());

        Auth::login($user);

        return redirect()->route('dashboard')
            ->with('status', 'Your application has been submitted and is pending review.');
    }
}
