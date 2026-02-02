<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Http\Requests\Patient\PatientAddressRequest;
use App\Models\UserAddress;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientAddressController extends Controller
{
    /**
     * Display a listing of the patient's saved addresses.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $addresses = $user->addresses()
            ->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('patient/addresses/index', [
            'addresses' => $addresses,
        ]);
    }

    /**
     * Store a newly created address.
     */
    public function store(PatientAddressRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        if ($validated['is_default'] ?? false) {
            $user->addresses()->update(['is_default' => false]);
        }

        $user->addresses()->create($validated);

        return back()->with('success', 'Address added successfully.');
    }

    /**
     * Update the specified address.
     */
    public function update(PatientAddressRequest $request, UserAddress $address): RedirectResponse
    {
        $user = $request->user();

        if ($address->user_id !== $user->id) {
            abort(403, 'Unauthorized access to address.');
        }

        $validated = $request->validated();

        if ($validated['is_default'] ?? false) {
            $user->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }

        $address->update($validated);

        return back()->with('success', 'Address updated successfully.');
    }

    /**
     * Remove the specified address.
     */
    public function destroy(Request $request, UserAddress $address): RedirectResponse
    {
        $user = $request->user();

        if ($address->user_id !== $user->id) {
            abort(403, 'Unauthorized access to address.');
        }

        if ($address->is_default && $user->addresses()->count() > 1) {
            return back()->with('error', 'Cannot delete default address. Please set another address as default first.');
        }

        $address->delete();

        return back()->with('success', 'Address deleted successfully.');
    }

    /**
     * Set the specified address as default.
     */
    public function setDefault(Request $request, UserAddress $address): RedirectResponse
    {
        $user = $request->user();

        if ($address->user_id !== $user->id) {
            abort(403, 'Unauthorized access to address.');
        }

        $user->addresses()->update(['is_default' => false]);
        $address->update(['is_default' => true]);

        return back()->with('success', 'Default address updated successfully.');
    }
}
