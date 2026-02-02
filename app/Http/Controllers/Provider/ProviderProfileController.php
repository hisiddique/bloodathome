<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Http\Requests\Provider\ProviderProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProviderProfileController extends Controller
{
    public function edit(): Response
    {
        $provider = auth()->user()->provider->load(['type', 'status', 'qualifications']);

        return Inertia::render('provider/profile/edit', [
            'provider' => $provider,
        ]);
    }

    public function update(ProviderProfileUpdateRequest $request): RedirectResponse
    {
        $provider = auth()->user()->provider;

        $provider->update($request->validated());

        return back()->with('success', 'Profile updated successfully.');
    }

    public function updatePhoto(Request $request): RedirectResponse
    {
        $provider = auth()->user()->provider;

        $validated = $request->validate([
            'photo' => ['required', 'image', 'max:5120'],
        ]);

        if ($provider->profile_image_url) {
            Storage::disk('public')->delete($provider->profile_image_url);
        }

        $path = $request->file('photo')->store('provider-photos', 'public');

        $provider->update([
            'profile_image_url' => $path,
        ]);

        return back()->with('success', 'Profile photo updated successfully.');
    }
}
