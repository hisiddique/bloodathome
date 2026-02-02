<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Http\Requests\Patient\PatientPaymentMethodRequest;
use App\Models\UserPaymentMethod;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientPaymentMethodController extends Controller
{
    /**
     * Display a listing of the patient's saved payment methods.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $paymentMethods = $user->paymentMethods()
            ->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('patient/payment-methods/index', [
            'paymentMethods' => $paymentMethods,
        ]);
    }

    /**
     * Store a newly created payment method.
     */
    public function store(PatientPaymentMethodRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        if ($validated['is_default'] ?? false) {
            $user->paymentMethods()->update(['is_default' => false]);
        }

        $user->paymentMethods()->create($validated);

        return back()->with('success', 'Payment method added successfully.');
    }

    /**
     * Remove the specified payment method.
     */
    public function destroy(Request $request, UserPaymentMethod $paymentMethod): RedirectResponse
    {
        $user = $request->user();

        if ($paymentMethod->user_id !== $user->id) {
            abort(403, 'Unauthorized access to payment method.');
        }

        if ($paymentMethod->is_default && $user->paymentMethods()->count() > 1) {
            return back()->with('error', 'Cannot delete default payment method. Please set another payment method as default first.');
        }

        $paymentMethod->delete();

        return back()->with('success', 'Payment method deleted successfully.');
    }

    /**
     * Set the specified payment method as default.
     */
    public function setDefault(Request $request, UserPaymentMethod $paymentMethod): RedirectResponse
    {
        $user = $request->user();

        if ($paymentMethod->user_id !== $user->id) {
            abort(403, 'Unauthorized access to payment method.');
        }

        $user->paymentMethods()->update(['is_default' => false]);
        $paymentMethod->update(['is_default' => true]);

        return back()->with('success', 'Default payment method updated successfully.');
    }
}
