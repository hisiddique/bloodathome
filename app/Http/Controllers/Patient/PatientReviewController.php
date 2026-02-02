<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Http\Requests\Patient\PatientReviewRequest;
use App\Models\Booking;
use Illuminate\Http\RedirectResponse;

class PatientReviewController extends Controller
{
    /**
     * Store a newly created review for a completed booking.
     */
    public function store(PatientReviewRequest $request, Booking $booking): RedirectResponse
    {
        $user = $request->user();

        if ($booking->user_id !== $user->id) {
            abort(403, 'Unauthorized access to booking.');
        }

        if ($booking->review) {
            return back()->with('error', 'You have already submitted a review for this booking.');
        }

        $completedStatus = $booking->status->name ?? '';
        if ($completedStatus !== 'Completed') {
            return back()->with('error', 'You can only review completed bookings.');
        }

        $validated = $request->validated();

        $booking->review()->create([
            'user_id' => $user->id,
            'provider_id' => $booking->provider_id,
            'rating' => $validated['rating'],
            'review_text' => $validated['review_text'] ?? null,
            'is_published' => true,
        ]);

        return back()->with('success', 'Thank you for your review!');
    }
}
