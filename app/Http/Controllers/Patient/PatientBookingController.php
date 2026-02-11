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
        $query = $user->bookings()
            ->with(['status', 'collectionType', 'provider.user', 'items.service', 'payment']);

        if ($status !== 'all') {
            $query->whereHas('status', function ($q) use ($status) {
                $q->where('name', ucfirst($status));
            });
        }

        $bookings = $query->orderBy('scheduled_date', 'desc')
            ->orderBy('time_slot', 'desc')
            ->paginate(10);

        return Inertia::render('patient/bookings/index', [
            'bookings' => $bookings,
            'filters' => [
                'status' => $status,
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
            'consents',
            'review',
            'conversation',
        ]);

        return Inertia::render('patient/bookings/show', [
            'booking' => $booking,
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
