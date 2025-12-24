<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Phlebotomist;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class BookingController extends Controller
{
    public function index(): Response
    {
        $bookings = auth()->user()
            ->bookings()
            ->with(['phlebotomist', 'bloodTest'])
            ->latest()
            ->paginate(10);

        return Inertia::render('bookings/index', [
            'bookings' => $bookings,
        ]);
    }

    public function create(): Response
    {
        $phlebotomists = Phlebotomist::query()
            ->approved()
            ->available()
            ->orderBy('rating', 'desc')
            ->get();

        return Inertia::render('booking/index', [
            'phlebotomists' => $phlebotomists,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'phlebotomist_id' => 'required|exists:phlebotomists,id',
            'blood_test_id' => 'nullable|exists:blood_tests,id',
            'appointment_date' => 'required|date|after:today',
            'time_slot' => 'required|string',
            'address' => 'required|string',
            'postcode' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'visit_type' => 'required|in:home,clinic',
            'price' => 'required|numeric|min:0',
            'patient_details' => 'nullable|array',
        ]);

        $phlebotomist = Phlebotomist::findOrFail($validated['phlebotomist_id']);

        $booking = Booking::create([
            'patient_id' => auth()->id(),
            'phlebotomist_id' => $validated['phlebotomist_id'],
            'phlebotomist_name' => $phlebotomist->name,
            'phlebotomist_image' => $phlebotomist->image,
            'blood_test_id' => $validated['blood_test_id'] ?? null,
            'appointment_date' => $validated['appointment_date'],
            'time_slot' => $validated['time_slot'],
            'address' => $validated['address'],
            'postcode' => $validated['postcode'] ?? null,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'visit_type' => $validated['visit_type'],
            'status' => 'pending',
            'price' => $validated['price'],
            'patient_details' => $validated['patient_details'] ?? null,
        ]);

        return redirect()->route('bookings.show', $booking)->with('success', 'Booking created successfully!');
    }

    public function show(Booking $booking): Response
    {
        $this->authorize('view', $booking);

        $booking->load(['phlebotomist', 'bloodTest', 'chatMessages.sender']);

        return Inertia::render('bookings/show', [
            'booking' => $booking,
        ]);
    }

    public function cancel(Booking $booking): RedirectResponse
    {
        $this->authorize('update', $booking);

        if ($booking->status === 'cancelled') {
            return back()->with('error', 'Booking is already cancelled.');
        }

        if ($booking->status === 'completed') {
            return back()->with('error', 'Cannot cancel a completed booking.');
        }

        $booking->update(['status' => 'cancelled']);

        return redirect()->route('bookings.index')->with('success', 'Booking cancelled successfully.');
    }
}
