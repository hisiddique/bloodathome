<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Http\Requests\Patient\PatientDependentRequest;
use App\Models\Dependent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientDependentController extends Controller
{
    /**
     * Display a listing of the patient's dependents.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $dependents = $user->dependents()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($dependent) {
                return [
                    'id' => $dependent->id,
                    'first_name' => $dependent->first_name,
                    'last_name' => $dependent->last_name,
                    'full_name' => $dependent->full_name,
                    'date_of_birth' => $dependent->date_of_birth->format('Y-m-d'),
                    'age' => $dependent->age,
                    'relationship' => $dependent->relationship,
                    'nhs_number' => $dependent->nhs_number,
                    'allergies' => $dependent->allergies,
                    'medical_conditions' => $dependent->medical_conditions,
                    'medications' => $dependent->medications,
                ];
            });

        return Inertia::render('patient/dependents/index', [
            'dependents' => $dependents,
        ]);
    }

    /**
     * Show the form for creating a new dependent.
     */
    public function create(): Response
    {
        return Inertia::render('patient/dependents/create');
    }

    /**
     * Store a newly created dependent.
     */
    public function store(PatientDependentRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $user->dependents()->create($validated);

        return redirect()->route('patient.dependents.index')
            ->with('success', 'Dependent added successfully.');
    }

    /**
     * Show the form for editing the specified dependent.
     */
    public function edit(Request $request, Dependent $dependent): Response
    {
        $user = $request->user();

        if ($dependent->user_id !== $user->id) {
            abort(403, 'Unauthorized access to dependent.');
        }

        return Inertia::render('patient/dependents/edit', [
            'dependent' => [
                'id' => $dependent->id,
                'first_name' => $dependent->first_name,
                'last_name' => $dependent->last_name,
                'date_of_birth' => $dependent->date_of_birth->format('Y-m-d'),
                'relationship' => $dependent->relationship,
                'nhs_number' => $dependent->nhs_number,
                'allergies' => $dependent->allergies,
                'medical_conditions' => $dependent->medical_conditions,
                'medications' => $dependent->medications,
            ],
        ]);
    }

    /**
     * Update the specified dependent.
     */
    public function update(PatientDependentRequest $request, Dependent $dependent): RedirectResponse
    {
        $user = $request->user();

        if ($dependent->user_id !== $user->id) {
            abort(403, 'Unauthorized access to dependent.');
        }

        $validated = $request->validated();
        $dependent->update($validated);

        return redirect()->route('patient.dependents.index')
            ->with('success', 'Dependent updated successfully.');
    }

    /**
     * Remove the specified dependent.
     */
    public function destroy(Request $request, Dependent $dependent): RedirectResponse
    {
        $user = $request->user();

        if ($dependent->user_id !== $user->id) {
            abort(403, 'Unauthorized access to dependent.');
        }

        $dependent->delete();

        return redirect()->route('patient.dependents.index')
            ->with('success', 'Dependent deleted successfully.');
    }
}
