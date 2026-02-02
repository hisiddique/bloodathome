<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProviderBookingController extends Controller
{
    public function index(Request $request): Response
    {
        $provider = auth()->user()->provider;

        $status = $request->input('status');

        $bookings = Booking::query()
            ->where('provider_id', $provider->id)
            ->with(['user', 'status', 'collectionType', 'items.service'])
            ->when($status, function ($query, $status) {
                $query->whereHas('status', function ($q) use ($status) {
                    $q->where('name', $status);
                });
            })
            ->orderByDesc('scheduled_date')
            ->orderByDesc('created_at')
            ->paginate(20);

        return Inertia::render('provider/bookings/index', [
            'bookings' => $bookings,
            'filters' => [
                'status' => $status,
            ],
        ]);
    }

    public function show(Booking $booking): Response
    {
        $provider = auth()->user()->provider;

        if ($booking->provider_id !== $provider->id) {
            abort(403, 'Unauthorized action.');
        }

        $booking->load([
            'user',
            'status',
            'collectionType',
            'items.service.category',
            'payment',
            'settlement.status',
        ]);

        return Inertia::render('provider/bookings/show', [
            'booking' => $booking,
        ]);
    }

    public function accept(Booking $booking): RedirectResponse
    {
        $provider = auth()->user()->provider;

        if ($booking->provider_id !== $provider->id) {
            abort(403, 'Unauthorized action.');
        }

        $confirmedStatus = BookingStatus::where('name', 'Confirmed')->first();

        if (! $confirmedStatus) {
            return back()->with('error', 'Unable to confirm booking. Please contact support.');
        }

        $booking->update([
            'status_id' => $confirmedStatus->id,
        ]);

        return back()->with('success', 'Booking accepted successfully.');
    }

    public function decline(Request $request, Booking $booking): RedirectResponse
    {
        $provider = auth()->user()->provider;

        if ($booking->provider_id !== $provider->id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $cancelledStatus = BookingStatus::where('name', 'Cancelled')->first();

        if (! $cancelledStatus) {
            return back()->with('error', 'Unable to decline booking. Please contact support.');
        }

        $booking->update([
            'status_id' => $cancelledStatus->id,
            'cancelled_at' => now(),
            'cancellation_reason' => $validated['reason'] ?? 'Declined by provider',
        ]);

        return back()->with('success', 'Booking declined successfully.');
    }

    public function complete(Booking $booking): RedirectResponse
    {
        $provider = auth()->user()->provider;

        if ($booking->provider_id !== $provider->id) {
            abort(403, 'Unauthorized action.');
        }

        $completedStatus = BookingStatus::where('name', 'Completed')->first();

        if (! $completedStatus) {
            return back()->with('error', 'Unable to complete booking. Please contact support.');
        }

        $booking->update([
            'status_id' => $completedStatus->id,
        ]);

        return back()->with('success', 'Booking marked as completed successfully.');
    }
}
