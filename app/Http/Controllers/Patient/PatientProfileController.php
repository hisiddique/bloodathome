<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Http\Requests\Patient\PatientProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientProfileController extends Controller
{
    /**
     * Show the patient profile edit form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $patient = $user->patient;

        return Inertia::render('patient/profile/edit', [
            'user' => $user,
            'patient' => $patient,
        ]);
    }

    /**
     * Update the patient's profile information.
     */
    public function update(PatientProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $user->update([
            'first_name' => $validated['first_name'],
            'middle_name' => $validated['middle_name'] ?? null,
            'last_name' => $validated['last_name'],
            'phone' => $validated['phone'],
        ]);

        if ($user->patient) {
            $user->patient->update([
                'date_of_birth' => $validated['date_of_birth'],
                'address_line1' => $validated['address_line1'],
                'address_line2' => $validated['address_line2'] ?? null,
                'town_city' => $validated['town_city'],
                'postcode' => $validated['postcode'],
            ]);
        }

        return back()->with('success', 'Profile updated successfully.');
    }
}
