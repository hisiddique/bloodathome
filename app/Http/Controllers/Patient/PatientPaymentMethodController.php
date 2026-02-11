<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use App\Models\UserPaymentMethod;
use App\Services\StripeService;
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
     * Show the form for creating a new payment method.
     */
    public function create(Request $request): Response
    {
        $user = $request->user();
        $stripeService = new StripeService;

        // Get or create Stripe customer
        $customerId = $stripeService->getOrCreateCustomer($user);

        // Create SetupIntent
        $setupIntent = \Stripe\SetupIntent::create([
            'customer' => $customerId,
            'payment_method_types' => ['card'],
        ]);

        $stripePublicKey = SystemSetting::getValue('api.stripe_public_key')
                           ?? config('services.stripe.key');

        return Inertia::render('patient/payment-methods/create', [
            'clientSecret' => $setupIntent->client_secret,
            'stripePublicKey' => $stripePublicKey,
        ]);
    }

    /**
     * Handle the Stripe redirect after SetupIntent confirmation.
     *
     * Stripe redirects here with ?setup_intent=seti_xxx query param.
     */
    public function setupComplete(Request $request): RedirectResponse
    {
        $user = $request->user();
        $setupIntentId = $request->query('setup_intent');

        if (! $setupIntentId) {
            return redirect()->route('patient.payment-methods.index')
                ->with('error', 'Invalid setup response.');
        }

        $stripeService = new StripeService;

        $setupIntent = \Stripe\SetupIntent::retrieve($setupIntentId);

        if ($setupIntent->status !== 'succeeded') {
            return redirect()->route('patient.payment-methods.index')
                ->with('error', 'Card setup was not completed. Please try again.');
        }

        $paymentMethodId = $setupIntent->payment_method;
        $customerId = $setupIntent->customer;

        // Check if this payment method was already saved (e.g. user refreshed the page)
        if (UserPaymentMethod::where('stripe_payment_method_id', $paymentMethodId)->exists()) {
            return redirect()->route('patient.payment-methods.index')
                ->with('success', 'Payment method already saved.');
        }

        $paymentMethod = \Stripe\PaymentMethod::retrieve($paymentMethodId);
        $isFirstPaymentMethod = ! UserPaymentMethod::where('user_id', $user->id)->exists();

        UserPaymentMethod::create([
            'user_id' => $user->id,
            'stripe_payment_method_id' => $paymentMethodId,
            'stripe_customer_id' => $customerId,
            'card_brand' => $paymentMethod->card->brand,
            'card_last_four' => $paymentMethod->card->last4,
            'card_exp_month' => $paymentMethod->card->exp_month,
            'card_exp_year' => $paymentMethod->card->exp_year,
            'is_default' => $isFirstPaymentMethod,
        ]);

        return redirect()->route('patient.payment-methods.index')
            ->with('success', 'Payment method added successfully.');
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
