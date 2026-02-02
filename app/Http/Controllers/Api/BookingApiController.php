<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ConfirmBookingRequest;
use App\Http\Requests\Api\CreateBookingDraftRequest;
use App\Http\Requests\Api\CreatePaymentIntentRequest;
use App\Http\Requests\Api\SearchProvidersRequest;
use App\Models\Booking;
use App\Models\BookingItem;
use App\Models\BookingStatus;
use App\Models\Provider;
use App\Models\ProviderService;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Services\ProviderSearchService;
use App\Services\StripeService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * BookingApiController
 *
 * RESTful API controller for booking flow
 */
class BookingApiController extends Controller
{
    public function __construct(
        protected ProviderSearchService $providerSearchService,
        protected StripeService $stripeService
    ) {}

    /**
     * Get available services, optionally filtered by collection type.
     */
    public function getServices(Request $request): JsonResponse
    {
        $collectionType = $request->input('collection_type');

        $query = Service::query()
            ->where('is_active', true)
            ->with(['category']);

        if ($collectionType) {
            $query->whereHas('serviceCollectionMappings', function ($q) use ($collectionType) {
                $q->whereHas('collectionType', function ($subQ) use ($collectionType) {
                    $subQ->where('name', $collectionType);
                });
            });
        }

        $services = $query->get();

        $categories = ServiceCategory::query()
            ->whereHas('services', function ($q) use ($services) {
                $q->whereIn('id', $services->pluck('id'));
            })
            ->get()
            ->map(function ($category) use ($services) {
                $categoryServices = $services->where('service_category_id', $category->id);

                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'description' => $category->description,
                    'services' => $categoryServices->map(function ($service) {
                        $collectionTypes = $service->serviceCollectionMappings()
                            ->with('collectionType')
                            ->get()
                            ->map(function ($mapping) {
                                return [
                                    'type' => $mapping->collectionType->name,
                                    'additional_cost' => (float) $mapping->additional_cost,
                                ];
                            });

                        return [
                            'id' => $service->id,
                            'name' => $service->service_name,
                            'code' => $service->service_code,
                            'description' => $service->service_description,
                            'collection_types' => $collectionTypes,
                        ];
                    })->values(),
                ];
            })
            ->filter(function ($category) {
                return $category['services']->isNotEmpty();
            })
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'categories' => $categories,
            ],
        ]);
    }

    /**
     * Search for providers near a location.
     */
    public function searchProviders(SearchProvidersRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $latitude = $validated['latitude'];
        $longitude = $validated['longitude'];
        $radiusKm = $validated['radius_km'] ?? null;

        $filters = [];
        if (isset($validated['service_id'])) {
            $filters['service_id'] = $validated['service_id'];
        }
        if (isset($validated['collection_type'])) {
            $filters['collection_type'] = $validated['collection_type'];
        }

        $providers = $this->providerSearchService->searchNearby(
            $latitude,
            $longitude,
            $radiusKm,
            $filters
        );

        $providerData = $providers->map(function ($provider) {
            return [
                'id' => $provider->id,
                'name' => $provider->provider_name,
                'type' => $provider->type->name ?? null,
                'distance_km' => $provider->distance_km,
                'average_rating' => (float) $provider->average_rating,
                'total_reviews' => $provider->total_reviews,
                'experience_years' => $provider->experience_years,
                'bio' => $provider->bio,
                'profile_image_url' => $provider->profile_image_url,
                'profile_thumbnail_url' => $provider->profile_thumbnail_url,
                'address' => [
                    'line1' => $provider->address_line1,
                    'line2' => $provider->address_line2,
                    'town_city' => $provider->town_city,
                    'postcode' => $provider->postcode,
                ],
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'providers' => $providerData,
                'search_params' => [
                    'radius_km' => $radiusKm ?? 10,
                    'center' => [
                        'lat' => $latitude,
                        'lng' => $longitude,
                    ],
                ],
            ],
        ]);
    }

    /**
     * Get available time slots for a provider on a specific date.
     */
    public function getProviderAvailability(Provider $provider, Request $request): JsonResponse
    {
        $request->validate([
            'date' => ['required', 'date', 'after_or_equal:today'],
        ]);

        $date = Carbon::parse($request->input('date'));

        $slots = $this->providerSearchService->getAvailableSlots($provider, $date);

        return response()->json([
            'success' => true,
            'data' => [
                'date' => $date->format('Y-m-d'),
                'slots' => $slots,
            ],
        ]);
    }

    /**
     * Create a booking draft.
     */
    public function createDraft(CreateBookingDraftRequest $request): JsonResponse
    {
        $validated = $request->validated();

        try {
            DB::beginTransaction();

            $provider = Provider::findOrFail($validated['provider_id']);

            $providerServices = ProviderService::query()
                ->where('provider_id', $provider->id)
                ->whereIn('service_id', $validated['service_items'])
                ->active()
                ->current()
                ->with('service')
                ->get();

            if ($providerServices->count() !== count($validated['service_items'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some selected services are not available from this provider.',
                ], 422);
            }

            $totalCost = $providerServices->sum('base_cost');

            $pendingStatus = BookingStatus::pending();
            if (! $pendingStatus) {
                throw new \RuntimeException('Pending booking status not found.');
            }

            $booking = Booking::create([
                'user_id' => auth()->id(),
                'provider_id' => $provider->id,
                'status_id' => $pendingStatus->id,
                'collection_type_id' => $validated['collection_type_id'],
                'nhs_number' => $validated['nhs_number'] ?? null,
                'scheduled_date' => $validated['scheduled_date'],
                'time_slot' => $validated['time_slot'],
                'service_address_line1' => $validated['service_address_line1'] ?? null,
                'service_address_line2' => $validated['service_address_line2'] ?? null,
                'service_town_city' => $validated['service_town_city'] ?? null,
                'service_postcode' => $validated['service_postcode'] ?? null,
                'grand_total_cost' => $totalCost,
                'visit_instructions' => $validated['visit_instructions'] ?? null,
                'patient_notes' => $validated['patient_notes'] ?? null,
                'draft_token' => Str::uuid()->toString(),
                'draft_expires_at' => now()->addMinutes(30),
            ]);

            foreach ($providerServices as $providerService) {
                BookingItem::create([
                    'booking_id' => $booking->id,
                    'catalog_id' => $providerService->id,
                    'item_cost' => $providerService->base_cost,
                    'agreed_comm_percent' => $providerService->agreed_commission_percent,
                    'created_at' => now(),
                ]);
            }

            DB::commit();

            Log::info('Booking draft created', [
                'booking_id' => $booking->id,
                'user_id' => auth()->id(),
                'provider_id' => $provider->id,
                'total_cost' => $totalCost,
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'booking_id' => $booking->id,
                    'draft_token' => $booking->draft_token,
                    'expires_at' => $booking->draft_expires_at->toISOString(),
                    'total_cost' => (float) $booking->grand_total_cost,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to create booking draft', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create booking draft. Please try again.',
            ], 500);
        }
    }

    /**
     * Create a Stripe payment intent for a booking.
     */
    public function createPaymentIntent(CreatePaymentIntentRequest $request): JsonResponse
    {
        $validated = $request->validated();

        try {
            $booking = Booking::where('id', $validated['booking_id'])
                ->where('draft_token', $validated['draft_token'])
                ->where('user_id', auth()->id())
                ->firstOrFail();

            if ($booking->draft_expires_at && $booking->draft_expires_at->isPast()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking draft has expired. Please create a new booking.',
                ], 422);
            }

            $pendingStatus = BookingStatus::pending();
            if ($booking->status_id !== $pendingStatus->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking is not in pending status.',
                ], 422);
            }

            $amountInPence = (int) ($booking->grand_total_cost * 100);

            $paymentIntent = $this->stripeService->createPaymentIntent(
                $amountInPence,
                'gbp',
                [
                    'booking_id' => $booking->id,
                    'user_id' => auth()->id(),
                ]
            );

            $booking->update([
                'stripe_payment_intent_id' => $paymentIntent->id,
            ]);

            Log::info('Payment intent created for booking', [
                'booking_id' => $booking->id,
                'payment_intent_id' => $paymentIntent->id,
                'amount' => $amountInPence,
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'client_secret' => $paymentIntent->client_secret,
                    'amount' => $amountInPence,
                    'currency' => 'gbp',
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create payment intent', [
                'error' => $e->getMessage(),
                'booking_id' => $validated['booking_id'] ?? null,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create payment intent. Please try again.',
            ], 500);
        }
    }

    /**
     * Confirm a booking after successful payment.
     */
    public function confirmBooking(ConfirmBookingRequest $request): JsonResponse
    {
        $validated = $request->validated();

        try {
            DB::beginTransaction();

            $booking = Booking::where('id', $validated['booking_id'])
                ->where('user_id', auth()->id())
                ->with(['provider', 'items.providerService.service', 'collectionType'])
                ->firstOrFail();

            if ($booking->stripe_payment_intent_id !== $validated['payment_intent_id']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment intent does not match booking.',
                ], 422);
            }

            $paymentIntent = $this->stripeService->confirmPayment($validated['payment_intent_id']);

            if ($paymentIntent->status !== 'succeeded') {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment has not been completed successfully.',
                ], 422);
            }

            $confirmedStatus = BookingStatus::confirmed();
            if (! $confirmedStatus) {
                throw new \RuntimeException('Confirmed booking status not found.');
            }

            $confirmationNumber = $booking->confirmation_number ?? Booking::generateConfirmationNumber();

            $booking->update([
                'status_id' => $confirmedStatus->id,
                'confirmation_number' => $confirmationNumber,
                'draft_token' => null,
                'draft_expires_at' => null,
            ]);

            DB::commit();

            Log::info('Booking confirmed', [
                'booking_id' => $booking->id,
                'confirmation_number' => $confirmationNumber,
                'payment_intent_id' => $validated['payment_intent_id'],
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'confirmation_number' => $confirmationNumber,
                    'booking' => [
                        'id' => $booking->id,
                        'status' => 'Confirmed',
                        'scheduled_date' => $booking->scheduled_date->format('Y-m-d'),
                        'time_slot' => $booking->time_slot,
                        'collection_type' => $booking->collectionType->name,
                        'provider' => [
                            'id' => $booking->provider->id,
                            'name' => $booking->provider->provider_name,
                            'type' => $booking->provider->type->name ?? null,
                        ],
                        'services' => $booking->items->map(function ($item) {
                            return [
                                'name' => $item->providerService->service->service_name ?? 'Unknown',
                                'cost' => (float) $item->item_cost,
                            ];
                        }),
                        'total_cost' => (float) $booking->grand_total_cost,
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to confirm booking', [
                'error' => $e->getMessage(),
                'booking_id' => $validated['booking_id'] ?? null,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to confirm booking. Please contact support.',
            ], 500);
        }
    }
}
