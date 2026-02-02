<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingStatus;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Models\PaymentStatus;
use App\Models\SystemSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

/**
 * StripeWebhookController
 *
 * Handle Stripe webhook events for payment status updates
 */
class StripeWebhookController extends Controller
{
    /**
     * Handle incoming Stripe webhook events.
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature');

        $webhookSecret = SystemSetting::getValue('api.stripe_webhook_secret')
                        ?? config('services.stripe.webhook_secret');

        if (! $webhookSecret) {
            Log::error('Stripe webhook secret not configured');

            return response()->json(['error' => 'Webhook secret not configured'], 500);
        }

        try {
            $event = Webhook::constructEvent(
                $payload,
                $signature,
                $webhookSecret
            );
        } catch (SignatureVerificationException $e) {
            Log::error('Stripe webhook signature verification failed', [
                'error' => $e->getMessage(),
            ]);

            return response()->json(['error' => 'Invalid signature'], 400);
        } catch (\Exception $e) {
            Log::error('Stripe webhook processing error', [
                'error' => $e->getMessage(),
            ]);

            return response()->json(['error' => 'Webhook error'], 400);
        }

        Log::info('Stripe webhook received', [
            'event_type' => $event->type,
            'event_id' => $event->id,
        ]);

        try {
            switch ($event->type) {
                case 'payment_intent.succeeded':
                    $this->handlePaymentIntentSucceeded($event->data->object);
                    break;

                case 'payment_intent.payment_failed':
                    $this->handlePaymentIntentFailed($event->data->object);
                    break;

                default:
                    Log::info('Unhandled webhook event type', ['type' => $event->type]);
            }
        } catch (\Exception $e) {
            Log::error('Error processing webhook event', [
                'event_type' => $event->type,
                'event_id' => $event->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json(['error' => 'Processing failed'], 500);
        }

        return response()->json(['success' => true]);
    }

    /**
     * Handle payment intent succeeded event.
     */
    protected function handlePaymentIntentSucceeded(object $paymentIntent): void
    {
        $paymentIntentId = $paymentIntent->id;

        $booking = Booking::where('stripe_payment_intent_id', $paymentIntentId)->first();

        if (! $booking) {
            Log::warning('Booking not found for payment intent', [
                'payment_intent_id' => $paymentIntentId,
            ]);

            return;
        }

        $existingPayment = Payment::where('stripe_payment_intent_id', $paymentIntentId)->first();
        if ($existingPayment) {
            Log::info('Payment already processed (idempotency check)', [
                'payment_intent_id' => $paymentIntentId,
                'payment_id' => $existingPayment->id,
            ]);

            return;
        }

        DB::beginTransaction();

        try {
            $confirmedStatus = BookingStatus::confirmed();
            if (! $confirmedStatus) {
                throw new \RuntimeException('Confirmed booking status not found');
            }

            $confirmationNumber = $booking->confirmation_number ?? Booking::generateConfirmationNumber();

            $booking->update([
                'status_id' => $confirmedStatus->id,
                'confirmation_number' => $confirmationNumber,
                'draft_token' => null,
                'draft_expires_at' => null,
            ]);

            $completedPaymentStatus = PaymentStatus::where('name', 'Completed')->first();
            if (! $completedPaymentStatus) {
                throw new \RuntimeException('Completed payment status not found');
            }

            $cardPaymentMethod = PaymentMethod::where('name', 'Card')->first();
            if (! $cardPaymentMethod) {
                throw new \RuntimeException('Card payment method not found');
            }

            $chargeId = null;
            $cardBrand = null;
            $cardLastFour = null;

            if (isset($paymentIntent->charges->data[0])) {
                $charge = $paymentIntent->charges->data[0];
                $chargeId = $charge->id;

                if (isset($charge->payment_method_details->card)) {
                    $cardBrand = $charge->payment_method_details->card->brand;
                    $cardLastFour = $charge->payment_method_details->card->last4;
                }
            }

            Payment::create([
                'booking_id' => $booking->id,
                'method_id' => $cardPaymentMethod->id,
                'amount' => $paymentIntent->amount / 100,
                'transaction_ref' => $paymentIntentId,
                'stripe_payment_intent_id' => $paymentIntentId,
                'stripe_charge_id' => $chargeId,
                'card_brand' => $cardBrand,
                'card_last_four' => $cardLastFour,
                'payment_status_id' => $completedPaymentStatus->id,
                'payment_date' => now(),
            ]);

            DB::commit();

            Log::info('Payment intent succeeded - booking confirmed', [
                'booking_id' => $booking->id,
                'confirmation_number' => $confirmationNumber,
                'payment_intent_id' => $paymentIntentId,
                'amount' => $paymentIntent->amount / 100,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to process payment success webhook', [
                'payment_intent_id' => $paymentIntentId,
                'booking_id' => $booking->id ?? null,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Handle payment intent failed event.
     */
    protected function handlePaymentIntentFailed(object $paymentIntent): void
    {
        $paymentIntentId = $paymentIntent->id;

        $booking = Booking::where('stripe_payment_intent_id', $paymentIntentId)->first();

        if (! $booking) {
            Log::warning('Booking not found for failed payment intent', [
                'payment_intent_id' => $paymentIntentId,
            ]);

            return;
        }

        $pendingStatus = BookingStatus::pending();
        if (! $pendingStatus) {
            Log::error('Pending booking status not found');

            return;
        }

        $booking->update([
            'status_id' => $pendingStatus->id,
        ]);

        Log::warning('Payment intent failed - booking kept as pending for retry', [
            'booking_id' => $booking->id,
            'payment_intent_id' => $paymentIntentId,
            'failure_message' => $paymentIntent->last_payment_error->message ?? 'Unknown error',
        ]);
    }
}
