<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Inertia\Inertia;
use Inertia\Response;

class ProviderDashboardController extends Controller
{
    public function index(): Response
    {
        $provider = auth()->user()->provider;

        $upcomingBookings = Booking::query()
            ->where('provider_id', $provider->id)
            ->with(['user', 'status', 'items.service'])
            ->whereHas('status', function ($q) {
                $q->whereIn('name', ['Pending', 'Confirmed']);
            })
            ->where('scheduled_date', '>=', now()->toDateString())
            ->orderBy('scheduled_date')
            ->orderBy('time_slot')
            ->limit(5)
            ->get()
            ->map(function (Booking $booking) {
                $patientName = $booking->user?->full_name ?? $booking->guest_name ?? 'Unknown Patient';
                $serviceName = $booking->items->first()?->service?->name ?? 'Blood Test';
                $address = collect([
                    $booking->service_address_line1,
                    $booking->service_town_city,
                    $booking->service_postcode,
                ])->filter()->implode(', ');

                return [
                    'id' => $booking->id,
                    'patient_name' => $patientName,
                    'scheduled_date' => $booking->scheduled_date?->toDateString(),
                    'time_slot' => $booking->time_slot,
                    'address' => $address,
                    'status' => $booking->status?->name,
                    'service' => $serviceName,
                ];
            });

        $todayBookings = Booking::query()
            ->where('provider_id', $provider->id)
            ->whereDate('scheduled_date', today())
            ->whereHas('status', function ($q) {
                $q->where('name', 'Confirmed');
            })
            ->count();

        $pendingBookings = Booking::query()
            ->where('provider_id', $provider->id)
            ->whereHas('status', function ($q) {
                $q->where('name', 'Pending');
            })
            ->count();

        $completedThisMonth = Booking::query()
            ->where('provider_id', $provider->id)
            ->whereMonth('scheduled_date', now()->month)
            ->whereYear('scheduled_date', now()->year)
            ->whereHas('status', function ($q) {
                $q->where('name', 'Completed');
            })
            ->count();

        $earningsThisMonth = $provider->settlements()
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('provider_payout_amount');

        $stats = [
            'today_bookings' => $todayBookings,
            'pending_bookings' => $pendingBookings,
            'completed_this_month' => $completedThisMonth,
            'earnings_this_month' => $earningsThisMonth,
            'average_rating' => $provider->average_rating,
            'total_reviews' => $provider->total_reviews,
        ];

        return Inertia::render('provider/dashboard', [
            'provider' => $provider->load('type', 'status'),
            'upcoming_bookings' => $upcomingBookings,
            'stats' => $stats,
        ]);
    }
}
