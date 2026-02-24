<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientBookingController extends Controller
{
    /**
     * Display a listing of the patient's bookings.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $status = $request->input('status', 'all');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        $query = $user->bookings()
            ->with(['status', 'provider.user']);

        if ($status !== 'all') {
            $query->whereHas('status', function ($q) use ($status) {
                $q->where('name', ucfirst($status));
            });
        }

        if ($dateFrom) {
            $query->whereDate('scheduled_date', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('scheduled_date', '<=', $dateTo);
        }

        $bookings = $query->orderBy('scheduled_date', 'desc')
            ->orderBy('time_slot', 'desc')
            ->paginate(10)
            ->through(function (Booking $booking) {
                $provider = $booking->relationLoaded('provider') ? $booking->provider : null;
                $providerUser = $provider?->relationLoaded('user') ? $provider->user : null;

                $addressParts = array_filter([
                    $booking->service_address_line1,
                    $booking->service_address_line2,
                    $booking->service_town_city,
                    $booking->service_postcode,
                ]);

                return [
                    'id' => $booking->id,
                    'confirmation_number' => $booking->confirmation_number,
                    'scheduled_date' => $booking->scheduled_date?->toDateString(),
                    'time_slot' => $booking->time_slot,
                    'address' => implode(', ', $addressParts),
                    'status' => $booking->status?->name,
                    'grand_total_cost' => (float) ($booking->grand_total_cost ?? 0),
                    'provider_id' => $provider?->id,
                    'provider_name' => $providerUser?->full_name ?? $provider?->provider_name,
                    'provider_image' => $providerUser?->profile_image ?? $provider?->profile_thumbnail_url,
                ];
            });

        return Inertia::render('patient/bookings/index', [
            'bookings' => $bookings,
            'filters' => [
                'status' => $status,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    /**
     * Display the specified booking.
     */
    public function show(Request $request, Booking $booking): Response
    {
        $user = $request->user();

        if ($booking->user_id !== $user->id) {
            abort(403, 'Unauthorized access to booking.');
        }

        $booking->load([
            'status',
            'collectionType',
            'provider.user',
            'provider.qualifications',
            'items.service.category',
            'payment.status',
            'review',
            'conversation',
        ]);

        $canCancel = ! $booking->isCancelled()
            && in_array($booking->status?->name, ['Pending', 'Confirmed']);

        $canReview = $booking->status?->name === 'Completed'
            && is_null($booking->review);

        return Inertia::render('patient/bookings/show', [
            'booking' => $booking,
            'can_cancel' => $canCancel,
            'can_review' => $canReview,
        ]);
    }

    /**
     * Cancel the specified booking.
     */
    public function cancel(Request $request, Booking $booking): RedirectResponse
    {
        $user = $request->user();

        if ($booking->user_id !== $user->id) {
            abort(403, 'Unauthorized access to booking.');
        }

        if ($booking->isCancelled()) {
            return back()->with('error', 'This booking has already been cancelled.');
        }

        $cancelledStatus = BookingStatus::where('name', 'Cancelled')->first();

        if (! $cancelledStatus) {
            return back()->with('error', 'Unable to cancel booking at this time.');
        }

        $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $booking->update([
            'status_id' => $cancelledStatus->id,
            'cancelled_at' => now(),
            'cancellation_reason' => $request->input('reason'),
        ]);

        return to_route('bookings.show', $booking)
            ->with('success', 'Booking cancelled successfully.');
    }
}
