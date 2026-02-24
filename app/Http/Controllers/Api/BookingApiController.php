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
use App\Models\CollectionType;
use App\Models\Patient;
use App\Models\Provider;
use App\Models\ProviderService;
use App\Models\Service;
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
            ->with(['category', 'serviceCollectionMappings.collectionType']);

        if ($collectionType) {
            $query->whereHas('serviceCollectionMappings', function ($q) use ($collectionType) {
                $q->whereHas('collectionType', function ($subQ) use ($collectionType) {
                    $subQ->where('name', $collectionType);
                });
            });
        }

        $services = $query->get()->map(function ($service) {
            return [
                'id' => $service->id,
                'service_name' => $service->service_name,
                'service_code' => $service->service_code,
                'service_description' => $service->service_description,
                'category' => [
                    'id' => $service->category->id ?? null,
                    'name' => $service->category->name ?? null,
                ],
                'is_active' => $service->is_active,
            ];
        });

        return response()->json([
            'services' => $services,
        ]);
    }

    /**
     * Get all collection types.
     */
    public function getCollectionTypes(): JsonResponse
    {
        $collectionTypes = CollectionType::query()
            ->orderBy('display_order')
            ->get()
            ->map(function ($type) {
                return [
                    'id' => $type->id,
                    'name' => $type->name,
                    'icon_class' => $type->icon_class,
                    'description' => $type->description,
                    'display_order' => $type->display_order,
                ];
            });

        return response()->json([
            'collectionTypes' => $collectionTypes,
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

        $serviceIds = $validated['service_ids'] ?? (isset($validated['service_id']) ? [$validated['service_id']] : null);

        // Filter out any stale/non-existent service IDs
        if ($serviceIds && count($serviceIds) > 0) {
            $validServiceIds = Service::whereIn('id', $serviceIds)->pluck('id')->toArray();
            $serviceIds = $validServiceIds ?: null;
        }

        $filters = [];
        if (isset($validated['service_id']) && ! isset($validated['service_ids'])) {
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

        // Pre-fetch service names to avoid N+1 queries
        $serviceNames = [];
        if ($serviceIds && count($serviceIds) > 0) {
            $serviceNames = Service::whereIn('id', $serviceIds)
                ->pluck('service_name', 'id')
                ->toArray();
        }

        $providerData = $providers->map(function ($provider) use ($serviceIds, $serviceNames) {
            $baseData = [
                'id' => $provider->id,
                'name' => $provider->provider_name,
                'type' => [
                    'id' => $provider->type->id ?? null,
                    'name' => $provider->type->name ?? null,
                ],
                'latitude' => (float) $provider->latitude,
                'longitude' => (float) $provider->longitude,
                'distance_km' => $provider->distance_km,
                'average_rating' => (float) $provider->average_rating,
                'total_reviews' => $provider->total_reviews,
                'experience_years' => $provider->experience_years,
                'bio' => $provider->bio,
                'profile_image_url' => $provider->profile_image_url,
                'profile_thumbnail_url' => $provider->profile_thumbnail_url,
                'show_image_in_search' => $provider->show_image_in_search,
                'user' => [
                    'full_name' => $provider->user->full_name ?? $provider->provider_name,
                    'profile_image' => $provider->user->profile_image ?? null,
                ],
                'address' => [
                    'line1' => $provider->address_line1,
                    'line2' => $provider->address_line2,
                    'town_city' => $provider->town_city,
                    'postcode' => $provider->postcode,
                ],
            ];

            if ($serviceIds && count($serviceIds) > 0) {
                $matchInfo = $this->providerSearchService->matchServicesForProvider($provider, $serviceIds, $serviceNames);
                $baseData = array_merge($baseData, [
                    'services_matched' => $matchInfo['services_matched'],
                    'services_total' => $matchInfo['services_total'],
                    'matched_services' => $matchInfo['matched'],
                    'unmatched_services' => $matchInfo['unmatched'],
                    'total_price' => $matchInfo['total_price'],
                ]);
            }

            return $baseData;
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

            // Determine if this is a guest booking
            $isGuest = ! auth()->check();
            $userId = $isGuest ? null : auth()->id();

            // For guest bookings, require guest details
            if ($isGuest) {
                if (empty($validated['guest_email']) || empty($validated['guest_name']) || empty($validated['guest_phone'])) {
                    DB::rollBack();

                    return response()->json([
                        'success' => false,
                        'message' => 'Guest name, email, and phone are required.',
                    ], 422);
                }
            }

            $provider = Provider::findOrFail($validated['provider_id']);

            $providerServices = ProviderService::query()
                ->where('provider_id', $provider->id)
                ->whereIn('service_id', $validated['service_items'])
                ->active()
                ->current()
                ->with('service')
                ->get();

            if ($providerServices->count() !== count($validated['service_items'])) {
                DB::rollBack();

                return response()->json([
                    'success' => false,
                    'message' => 'Some selected services are not available from this provider.',
                ], 422);
            }

            $subtotal = $providerServices->sum('base_cost');
            $pricing = Booking::calculatePricing((float) $subtotal);

            $pendingStatus = BookingStatus::pending();
            if (! $pendingStatus) {
                Log::critical('BookingStatus "Pending" record missing - run: php artisan db:seed --class=BookingStatusSeeder');
                throw new \RuntimeException('System configuration error. Please contact support.');
            }

            $bookingData = [
                'user_id' => $userId,
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
                ...$pricing,
                'visit_instructions' => $validated['visit_instructions'] ?? null,
                'patient_notes' => $validated['patient_notes'] ?? null,
                'draft_token' => Str::uuid()->toString(),
                'draft_expires_at' => now()->addMinutes(30),
                'is_guest_booking' => $isGuest,
            ];

            // Add guest-specific fields if guest booking
            if ($isGuest) {
                $bookingData['guest_email'] = $validated['guest_email'];
                $bookingData['guest_name'] = $validated['guest_name'];
                $bookingData['guest_phone'] = $validated['guest_phone'];
            }

            $booking = Booking::create($bookingData);

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
                'user_id' => $userId,
                'is_guest' => $isGuest,
                'guest_email' => $isGuest ? $validated['guest_email'] : null,
                'provider_id' => $provider->id,
                'subtotal' => $pricing['subtotal_amount'],
                'grand_total' => $pricing['grand_total_cost'],
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
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Provider not found.',
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to create booking draft', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
                'is_guest' => ! auth()->check(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create booking draft. Please try again.',
            ], 500);
        }
    }

    /**
     * Update an existing booking draft.
     */
    public function updateDraft(Booking $booking, CreateBookingDraftRequest $request): JsonResponse
    {
        $validated = $request->validated();

        try {
            if ($booking->user_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to update this booking.',
                ], 403);
            }

            $pendingStatus = BookingStatus::pending();
            if (! $pendingStatus || $booking->status_id !== $pendingStatus->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only pending bookings can be updated.',
                ], 422);
            }

            if ($booking->draft_expires_at && $booking->draft_expires_at->isPast()) {
                return response()->json([
                    'success' => false,
                    'error_code' => 'DRAFT_EXPIRED',
                    'message' => 'This booking draft has expired. Please create a new booking.',
                ], 422);
            }

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
                DB::rollBack();

                return response()->json([
                    'success' => false,
                    'message' => 'Some selected services are not available from this provider.',
                ], 422);
            }

            $subtotal = $providerServices->sum('base_cost');
            $pricing = Booking::calculatePricing((float) $subtotal);

            $booking->update([
                'provider_id' => $provider->id,
                'collection_type_id' => $validated['collection_type_id'],
                'nhs_number' => $validated['nhs_number'] ?? null,
                'scheduled_date' => $validated['scheduled_date'],
                'time_slot' => $validated['time_slot'],
                'service_address_line1' => $validated['service_address_line1'] ?? null,
                'service_address_line2' => $validated['service_address_line2'] ?? null,
                'service_town_city' => $validated['service_town_city'] ?? null,
                'service_postcode' => $validated['service_postcode'] ?? null,
                ...$pricing,
                'visit_instructions' => $validated['visit_instructions'] ?? null,
                'patient_notes' => $validated['patient_notes'] ?? null,
                'draft_expires_at' => now()->addMinutes(30),
            ]);

            BookingItem::where('booking_id', $booking->id)->delete();

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

            Log::info('Booking draft updated', [
                'booking_id' => $booking->id,
                'user_id' => auth()->id(),
                'provider_id' => $provider->id,
                'subtotal' => $pricing['subtotal_amount'],
                'grand_total' => $pricing['grand_total_cost'],
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
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Provider not found.',
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to update booking draft', [
                'error' => $e->getMessage(),
                'booking_id' => $booking->id,
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update booking draft. Please try again.',
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
            $query = Booking::where('id', $validated['booking_id']);

            // For authenticated users, verify ownership
            // For guests, verify it's a guest booking (user_id is null)
            if (auth()->check()) {
                $query->where('user_id', auth()->id());
            } else {
                $query->whereNull('user_id')->where('is_guest_booking', true);
            }

            $booking = $query->firstOrFail();

            if ($booking->draft_expires_at && $booking->draft_expires_at->isPast()) {
                return response()->json([
                    'success' => false,
                    'error_code' => 'DRAFT_EXPIRED',
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

            $amountInPence = (int) round($booking->grand_total_cost * 100);

            $metadata = [
                'booking_id' => $booking->id,
            ];

            if (auth()->check()) {
                $metadata['user_id'] = auth()->id();
            } else {
                $metadata['guest_email'] = $booking->guest_email;
            }

            $paymentIntent = $this->stripeService->createPaymentIntent(
                $amountInPence,
                'gbp',
                $metadata
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
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found or access denied.',
            ], 404);
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
     * Apply a promo code to a booking.
     */
    public function applyPromoCode(Request $request, Booking $booking): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Promo codes are not yet available.',
        ], 422);
    }

    /**
     * Confirm a booking after successful payment.
     */
    public function confirmBooking(ConfirmBookingRequest $request): JsonResponse
    {
        $validated = $request->validated();

        try {
            DB::beginTransaction();

            $query = Booking::where('id', $validated['booking_id'])
                ->with(['provider', 'items.providerService.service', 'collectionType']);

            // For authenticated users, verify ownership
            // For guests, verify it's a guest booking (user_id is null)
            if (auth()->check()) {
                $query->where('user_id', auth()->id());
            } else {
                $query->whereNull('user_id')->where('is_guest_booking', true);
            }

            $booking = $query->firstOrFail();

            if ($booking->stripe_payment_intent_id !== $validated['payment_intent_id']) {
                DB::rollBack();

                return response()->json([
                    'success' => false,
                    'message' => 'Payment intent does not match booking.',
                ], 422);
            }

            // Idempotency: if already confirmed, return success without re-processing
            $confirmedStatus = BookingStatus::confirmed();
            if ($confirmedStatus && $booking->status_id === $confirmedStatus->id) {
                DB::rollBack();

                return response()->json([
                    'success' => true,
                    'data' => [
                        'confirmation_number' => $booking->confirmation_number,
                        'booking' => [
                            'id' => $booking->id,
                            'status' => 'Confirmed',
                        ],
                    ],
                ]);
            }

            $paymentIntent = $this->stripeService->confirmPayment($validated['payment_intent_id']);

            if ($paymentIntent->status === 'processing') {
                DB::rollBack();

                return response()->json([
                    'success' => false,
                    'message' => 'Payment is still processing. Please wait a moment and try again.',
                    'status' => 'processing',
                ], 202);
            }

            if ($paymentIntent->status !== 'succeeded') {
                DB::rollBack();

                Log::warning('Payment not completed', [
                    'payment_intent_id' => $validated['payment_intent_id'],
                    'status' => $paymentIntent->status,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Payment has not been completed successfully.',
                ], 422);
            }

            $confirmedStatus = BookingStatus::confirmed();
            if (! $confirmedStatus) {
                Log::critical('BookingStatus "Confirmed" record missing - run: php artisan db:seed --class=BookingStatusSeeder');
                throw new \RuntimeException('System configuration error. Please contact support.');
            }

            $confirmationNumber = $booking->confirmation_number ?? Booking::generateConfirmationNumber();

            $booking->update([
                'status_id' => $confirmedStatus->id,
                'confirmation_number' => $confirmationNumber,
                'draft_token' => null,
                'draft_expires_at' => null,
                'consented_at' => now(),
                'consent_version' => 'v1',
            ]);

            // Auto-save NHS number to the patient profile if not already set
            if (auth()->check() && ! empty($booking->nhs_number)) {
                $patient = auth()->user()->patient;
                if ($patient && $patient->nhs_number === null) {
                    $exists = Patient::where('nhs_number', $booking->nhs_number)
                        ->where('id', '!=', $patient->id)
                        ->exists();

                    if (! $exists) {
                        $patient->update(['nhs_number' => $booking->nhs_number]);
                    }
                }
            }

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
                        'subtotal_amount' => (float) $booking->subtotal_amount,
                        'service_fee_percent' => (float) $booking->service_fee_percent,
                        'service_fee_amount' => (float) $booking->service_fee_amount,
                        'vat_percent' => (float) $booking->vat_percent,
                        'vat_amount' => (float) $booking->vat_amount,
                        'discount_amount' => (float) $booking->discount_amount,
                        'total_cost' => (float) $booking->grand_total_cost,
                    ],
                ],
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Booking not found or access denied.',
            ], 404);
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

    /**
     * Save an address for the authenticated user.
     */
    public function saveAddress(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'label' => ['required', 'string', 'max:100'],
            'address_line1' => ['required', 'string', 'max:255'],
            'address_line2' => ['nullable', 'string', 'max:255'],
            'town_city' => ['required', 'string', 'max:255'],
            'postcode' => ['required', 'string', 'max:10'],
        ]);

        try {
            $address = $request->user()->addresses()->create($validated);

            Log::info('Address saved during booking', [
                'user_id' => $request->user()->id,
                'address_id' => $address->id,
                'label' => $validated['label'],
            ]);

            return response()->json([
                'success' => true,
                'data' => ['address' => $address],
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to save address', [
                'error' => $e->getMessage(),
                'user_id' => $request->user()->id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to save address. Please try again.',
            ], 500);
        }
    }

    /**
     * Store a new dependent for the authenticated user.
     */
    public function storeDependent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'date_of_birth' => ['required', 'date', 'before:today'],
            'relationship' => ['required', 'in:child,spouse,parent,other'],
            'nhs_number' => ['nullable', 'string', 'max:10'],
        ]);

        try {
            $dependent = $request->user()->dependents()->create($validated);

            return response()->json([
                'success' => true,
                'dependent' => [
                    'id' => $dependent->id,
                    'first_name' => $dependent->first_name,
                    'last_name' => $dependent->last_name,
                    'full_name' => $dependent->full_name,
                    'date_of_birth' => $dependent->date_of_birth->format('Y-m-d'),
                    'relationship' => $dependent->relationship,
                    'nhs_number' => $dependent->nhs_number,
                ],
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to store dependent', [
                'error' => $e->getMessage(),
                'user_id' => $request->user()->id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to add dependent. Please try again.',
            ], 500);
        }
    }

    /**
     * Save NHS number for the authenticated user's patient profile.
     */
    public function saveNhsNumber(Request $request): JsonResponse
    {
        $patient = $request->user()->patient;

        if (! $patient) {
            return response()->json([
                'success' => false,
                'message' => 'Patient profile not found. Please complete your registration.',
            ], 422);
        }

        $validated = $request->validate([
            'nhs_number' => ['required', 'string', 'size:10', 'regex:/^\d{10}$/', 'unique:patients,nhs_number,'.$patient->id],
        ]);

        $patient->update(['nhs_number' => $validated['nhs_number']]);

        return response()->json(['success' => true]);
    }

    /**
     * Save NHS number for a dependent.
     */
    public function saveDependentNhsNumber(Request $request, \App\Models\Dependent $dependent): JsonResponse
    {
        if ($dependent->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'nhs_number' => ['required', 'string', 'size:10', 'regex:/^\d{10}$/'],
        ]);

        $dependent->update(['nhs_number' => $validated['nhs_number']]);

        return response()->json(['success' => true]);
    }
}
