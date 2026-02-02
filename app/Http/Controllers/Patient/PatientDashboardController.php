<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientDashboardController extends Controller
{
    /**
     * Display the patient dashboard with upcoming bookings and quick actions.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $upcomingBookings = $user->bookings()
            ->with(['status', 'collectionType', 'provider.user', 'items.service'])
            ->whereHas('status', function ($query) {
                $query->whereIn('name', ['Confirmed', 'In Progress']);
            })
            ->where('scheduled_date', '>=', now())
            ->orderBy('scheduled_date', 'asc')
            ->orderBy('time_slot', 'asc')
            ->limit(5)
            ->get();

        $recentBookings = $user->bookings()
            ->with(['status', 'collectionType', 'provider.user'])
            ->whereHas('status', function ($query) {
                $query->where('name', 'Completed');
            })
            ->orderBy('scheduled_date', 'desc')
            ->limit(3)
            ->get();

        $pendingReviews = $user->bookings()
            ->with(['provider.user', 'review'])
            ->whereHas('status', function ($query) {
                $query->where('name', 'Completed');
            })
            ->whereDoesntHave('review')
            ->orderBy('scheduled_date', 'desc')
            ->limit(3)
            ->get();

        return Inertia::render('patient/dashboard', [
            'upcomingBookings' => $upcomingBookings,
            'recentBookings' => $recentBookings,
            'pendingReviews' => $pendingReviews,
            'totalBookings' => $user->bookings()->count(),
        ]);
    }
}
