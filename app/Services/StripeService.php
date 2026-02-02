<?php

namespace App\Services;

use App\Models\SystemSetting;
use App\Models\User;
use App\Models\UserPaymentMethod;
use Illuminate\Support\Facades\Log;
use Stripe\Customer;
use Stripe\Exception\ApiErrorException;
use Stripe\PaymentIntent;
use Stripe\PaymentMethod;
use Stripe\Refund;
use Stripe\Stripe;

/**
 * StripeService
 *
 * Comprehensive service for all Stripe payment operations
 */
class StripeService
{
    /**
     * Initialize Stripe API with secret key.
     */
    public function __construct()
    {
        $secretKey = SystemSetting::getValue('api.stripe_secret_key')
                     ?? config('services.stripe.secret');

        if (! $secretKey) {
            throw new \RuntimeException('Stripe secret key is not configured.');
        }

        Stripe::setApiKey($secretKey);
    }

    /**
     * Create a new payment intent.
     */
    public function createPaymentIntent(int $amount, string $currency = 'gbp', array $metadata = []): PaymentIntent
    {
        try {
            $paymentIntent = PaymentIntent::create([
                'amount' => $amount,
                'currency' => $currency,
                'metadata' => $metadata,
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

            Log::info('Stripe PaymentIntent created', [
                'payment_intent_id' => $paymentIntent->id,
                'amount' => $amount,
                'currency' => $currency,
                'metadata' => $metadata,
            ]);

            return $paymentIntent;
        } catch (ApiErrorException $e) {
            Log::error('Stripe PaymentIntent creation failed', [
                'error' => $e->getMessage(),
                'amount' => $amount,
                'currency' => $currency,
            ]);

            throw new \RuntimeException('Failed to create payment intent: '.$e->getMessage(), 0, $e);
        }
    }

    /**
     * Confirm a payment intent.
     */
    public function confirmPayment(string $paymentIntentId): PaymentIntent
    {
        try {
            $paymentIntent = PaymentIntent::retrieve($paymentIntentId);

            if ($paymentIntent->status === 'requires_confirmation') {
                $paymentIntent = $paymentIntent->confirm();
            }

            Log::info('Stripe PaymentIntent confirmed', [
                'payment_intent_id' => $paymentIntentId,
                'status' => $paymentIntent->status,
            ]);

            return $paymentIntent;
        } catch (ApiErrorException $e) {
            Log::error('Stripe PaymentIntent confirmation failed', [
                'error' => $e->getMessage(),
                'payment_intent_id' => $paymentIntentId,
            ]);

            throw new \RuntimeException('Failed to confirm payment: '.$e->getMessage(), 0, $e);
        }
    }

    /**
     * Create a new Stripe customer.
     */
    public function createCustomer(User $user): Customer
    {
        try {
            $customer = Customer::create([
                'name' => $user->full_name,
                'email' => $user->email,
                'metadata' => [
                    'user_id' => $user->id,
                ],
            ]);

            Log::info('Stripe Customer created', [
                'customer_id' => $customer->id,
                'user_id' => $user->id,
                'email' => $user->email,
            ]);

            return $customer;
        } catch (ApiErrorException $e) {
            Log::error('Stripe Customer creation failed', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
            ]);

            throw new \RuntimeException('Failed to create customer: '.$e->getMessage(), 0, $e);
        }
    }

    /**
     * Attach a payment method to a customer.
     */
    public function attachPaymentMethod(string $customerId, string $paymentMethodId): PaymentMethod
    {
        try {
            $paymentMethod = PaymentMethod::retrieve($paymentMethodId);
            $paymentMethod->attach(['customer' => $customerId]);

            $customer = Customer::retrieve($customerId);
            $isFirstMethod = empty($customer->invoice_settings->default_payment_method);

            if ($isFirstMethod) {
                Customer::update($customerId, [
                    'invoice_settings' => [
                        'default_payment_method' => $paymentMethodId,
                    ],
                ]);
            }

            Log::info('Stripe PaymentMethod attached to customer', [
                'customer_id' => $customerId,
                'payment_method_id' => $paymentMethodId,
                'set_as_default' => $isFirstMethod,
            ]);

            return $paymentMethod;
        } catch (ApiErrorException $e) {
            Log::error('Stripe PaymentMethod attachment failed', [
                'error' => $e->getMessage(),
                'customer_id' => $customerId,
                'payment_method_id' => $paymentMethodId,
            ]);

            throw new \RuntimeException('Failed to attach payment method: '.$e->getMessage(), 0, $e);
        }
    }

    /**
     * Get or create a Stripe customer ID for a user.
     */
    public function getOrCreateCustomer(User $user): string
    {
        $existingPaymentMethod = UserPaymentMethod::where('user_id', $user->id)
            ->whereNotNull('stripe_customer_id')
            ->first();

        if ($existingPaymentMethod) {
            return $existingPaymentMethod->stripe_customer_id;
        }

        $customer = $this->createCustomer($user);

        return $customer->id;
    }

    /**
     * Save a payment method to the database.
     */
    public function savePaymentMethod(User $user, string $paymentMethodId): UserPaymentMethod
    {
        try {
            $customerId = $this->getOrCreateCustomer($user);
            $this->attachPaymentMethod($customerId, $paymentMethodId);

            $paymentMethod = PaymentMethod::retrieve($paymentMethodId);

            $isFirstPaymentMethod = ! UserPaymentMethod::where('user_id', $user->id)->exists();

            $userPaymentMethod = UserPaymentMethod::create([
                'user_id' => $user->id,
                'stripe_payment_method_id' => $paymentMethodId,
                'stripe_customer_id' => $customerId,
                'card_brand' => $paymentMethod->card->brand,
                'card_last_four' => $paymentMethod->card->last4,
                'card_exp_month' => $paymentMethod->card->exp_month,
                'card_exp_year' => $paymentMethod->card->exp_year,
                'is_default' => $isFirstPaymentMethod,
            ]);

            Log::info('Payment method saved to database', [
                'user_id' => $user->id,
                'payment_method_id' => $userPaymentMethod->id,
                'stripe_payment_method_id' => $paymentMethodId,
            ]);

            return $userPaymentMethod;
        } catch (ApiErrorException $e) {
            Log::error('Failed to save payment method', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'payment_method_id' => $paymentMethodId,
            ]);

            throw new \RuntimeException('Failed to save payment method: '.$e->getMessage(), 0, $e);
        }
    }

    /**
     * Refund a payment.
     */
    public function refundPayment(string $paymentIntentId, ?int $amount = null): Refund
    {
        try {
            $refundData = ['payment_intent' => $paymentIntentId];

            if ($amount !== null) {
                $refundData['amount'] = $amount;
            }

            $refund = Refund::create($refundData);

            Log::info('Stripe Refund created', [
                'refund_id' => $refund->id,
                'payment_intent_id' => $paymentIntentId,
                'amount' => $amount ?? 'full',
                'status' => $refund->status,
            ]);

            return $refund;
        } catch (ApiErrorException $e) {
            Log::error('Stripe Refund failed', [
                'error' => $e->getMessage(),
                'payment_intent_id' => $paymentIntentId,
                'amount' => $amount,
            ]);

            throw new \RuntimeException('Failed to process refund: '.$e->getMessage(), 0, $e);
        }
    }
}
