<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function index(): Response
    {
        $bookings = auth()->user()
            ->bookings()
            ->with(['provider', 'status', 'items.service'])
            ->latest()
            ->paginate(10);

        return Inertia::render('bookings/index', [
            'bookings' => $bookings,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'provider_id' => 'required|exists:providers,id',
            'service_ids' => 'nullable|array',
            'service_ids.*' => 'exists:services,id',
            'scheduled_date' => 'required|date|after:today',
            'time_slot' => 'required|string',
            'collection_type' => 'required|string|in:home_visit,clinic_visit,postal',
            'service_address_line1' => 'required|string',
            'service_town_city' => 'required|string',
            'service_postcode' => 'required|string',
            'grand_total_cost' => 'required|numeric|min:0',
            'nhs_number' => 'nullable|string',
            'visit_instructions' => 'nullable|string',
        ]);

        $booking = Booking::create([
            'user_id' => auth()->id(),
            'provider_id' => $validated['provider_id'],
            'confirmation_number' => Booking::generateConfirmationNumber(),
            'scheduled_date' => $validated['scheduled_date'],
            'time_slot' => $validated['time_slot'],
            'service_address_line1' => $validated['service_address_line1'],
            'service_town_city' => $validated['service_town_city'],
            'service_postcode' => $validated['service_postcode'],
            'grand_total_cost' => $validated['grand_total_cost'],
            'nhs_number' => $validated['nhs_number'] ?? null,
            'visit_instructions' => $validated['visit_instructions'] ?? null,
        ]);

        // Create booking items for each service
        if (! empty($validated['service_ids'])) {
            foreach ($validated['service_ids'] as $serviceId) {
                $booking->items()->create([
                    'service_id' => $serviceId,
                    // Additional fields like item_cost, quantity can be added here
                ]);
            }
        }

        return redirect()->route('bookings.show', $booking)->with('success', 'Booking created successfully!');
    }

    public function show(Booking $booking): Response
    {
        $this->authorize('view', $booking);

        $booking->load([
            'provider.type',
            'status',
            'items.service',
            'collectionType',
        ]);

        return Inertia::render('bookings/show', [
            'booking' => $booking,
        ]);
    }

    public function cancel(Booking $booking): RedirectResponse
    {
        $this->authorize('update', $booking);

        if ($booking->isCancelled()) {
            return back()->with('error', 'Booking is already cancelled.');
        }

        $booking->update([
            'cancelled_at' => now(),
            'cancellation_reason' => request()->input('reason', 'Cancelled by patient'),
        ]);

        return redirect()->route('bookings.index')->with('success', 'Booking cancelled successfully.');
    }

    public function wizard(): Response
    {
        $userData = null;
        $userAddresses = [];
        $userPaymentMethods = [];
        $userDependents = [];

        if (auth()->check()) {
            $user = auth()->user();
            $userData = [
                'name' => $user->full_name,
                'email' => $user->email,
                'phone' => $user->phone,
            ];

            $userAddresses = $user->addresses()->get()->map(function ($address) {
                return [
                    'id' => $address->id,
                    'label' => $address->label,
                    'address_line1' => $address->address_line1,
                    'address_line2' => $address->address_line2,
                    'town_city' => $address->town_city,
                    'postcode' => $address->postcode,
                    'is_default' => $address->is_default,
                ];
            });

            $userPaymentMethods = $user->paymentMethods()
                ->get()
                ->filter(fn ($pm) => ! $pm->isExpired())
                ->map(function ($method) {
                    return [
                        'id' => $method->id,
                        'card_brand' => $method->card_brand,
                        'card_last_four' => $method->card_last_four,
                        'card_exp_month' => $method->card_exp_month,
                        'card_exp_year' => $method->card_exp_year,
                        'is_default' => $method->is_default,
                    ];
                });

            $userDependents = $user->dependents()
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($dependent) {
                    return [
                        'id' => $dependent->id,
                        'first_name' => $dependent->first_name,
                        'last_name' => $dependent->last_name,
                        'full_name' => $dependent->full_name,
                        'date_of_birth' => $dependent->date_of_birth->format('Y-m-d'),
                        'relationship' => $dependent->relationship,
                        'nhs_number' => $dependent->nhs_number,
                    ];
                });
        }

        return Inertia::render('book/index', [
            'userData' => $userData,
            'userAddresses' => $userAddresses,
            'userPaymentMethods' => $userPaymentMethods,
            'userDependents' => $userDependents,
        ]);
    }
}
