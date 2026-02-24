<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProviderEarningsController extends Controller
{
    public function index(Request $request): Response
    {
        $provider = auth()->user()->provider;

        $period = $request->input('period', 'all');

        $earningsQuery = $provider->settlements()
            ->with([
                'booking.user',
                'booking.items.service',
                'status',
            ]);

        if ($period === 'month') {
            $earningsQuery->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year);
        } elseif ($period === 'week') {
            $earningsQuery->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
        }

        $settlements = $earningsQuery
            ->orderByDesc('created_at')
            ->paginate(20);

        $earnings = $settlements->getCollection()->map(function ($settlement) {
            $booking = $settlement->booking;
            $user = $booking?->user;
            $patientName = $user?->full_name ?? $booking?->guest_name ?? 'Unknown';
            $firstItem = $booking?->items?->first();
            $serviceName = $firstItem?->service?->name ?? 'Blood Test';

            return [
                'id' => $settlement->id,
                'booking_id' => $settlement->booking_id,
                'patient_name' => $patientName,
                'service' => $serviceName,
                'amount' => (float) $settlement->provider_payout_amount,
                'date' => $settlement->created_at->toDateString(),
                'status' => strtolower($settlement->status?->name ?? 'pending'),
            ];
        });

        $allSettlements = $provider->settlements();

        $summary = [
            'total_earnings' => (float) $allSettlements->sum('provider_payout_amount'),
            'this_month' => (float) $provider->settlements()
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('provider_payout_amount'),
            'this_week' => (float) $provider->settlements()
                ->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
                ->sum('provider_payout_amount'),
            'pending' => (float) $provider->settlements()
                ->whereHas('status', fn ($q) => $q->where('name', 'Pending'))
                ->sum('provider_payout_amount'),
            'completed_bookings' => $provider->settlements()
                ->whereHas('status', fn ($q) => $q->whereIn('name', ['Paid', 'Processing']))
                ->count(),
        ];

        return Inertia::render('provider/earnings/index', [
            'earnings' => $earnings,
            'summary' => $summary,
            'filters' => [
                'period' => $period,
            ],
        ]);
    }
}
