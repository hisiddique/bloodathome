<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Http\Requests\Patient\PatientMedicalInfoUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientMedicalInfoController extends Controller
{
    /**
     * Show the patient medical information edit form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $patient = $user->patient;

        return Inertia::render('patient/medical-info/edit', [
            'patient' => $patient,
        ]);
    }

    /**
     * Update the patient's medical information.
     */
    public function update(PatientMedicalInfoUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        if ($user->patient) {
            $user->patient->update([
                'nhs_number' => $validated['nhs_number'] ?? null,
                'known_blood_type' => $validated['known_blood_type'] ?? null,
                'known_allergies' => $validated['known_allergies'] ?? null,
                'current_medications' => $validated['current_medications'] ?? null,
                'medical_conditions' => $validated['medical_conditions'] ?? null,
            ]);
        }

        return back()->with('success', 'Medical information updated successfully.');
    }
}
