<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProviderEarningsController extends Controller
{
    public function index(Request $request): Response
    {
        $provider = auth()->user()->provider;

        $year = $request->input('year', now()->year);
        $month = $request->input('month');

        $earningsQuery = $provider->settlements()
            ->with(['booking.status', 'status'])
            ->whereYear('created_at', $year);

        if ($month) {
            $earningsQuery->whereMonth('created_at', $month);
        }

        $earnings = $earningsQuery
            ->orderByDesc('created_at')
            ->paginate(20);

        $totalEarnings = $earningsQuery->sum('provider_payout_amount');
        $totalCommission = $earningsQuery->sum('commission_amount');
        $totalCollected = $earningsQuery->sum('collected_amount');

        $monthlyBreakdown = $provider->settlements()
            ->whereYear('created_at', $year)
            ->select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('SUM(provider_payout_amount) as total_payout'),
                DB::raw('SUM(commission_amount) as total_commission'),
                DB::raw('COUNT(*) as booking_count')
            )
            ->groupBy(DB::raw('MONTH(created_at)'))
            ->orderBy('month')
            ->get();

        return Inertia::render('provider/earnings/index', [
            'earnings' => $earnings,
            'summary' => [
                'total_earnings' => $totalEarnings,
                'total_commission' => $totalCommission,
                'total_collected' => $totalCollected,
            ],
            'monthlyBreakdown' => $monthlyBreakdown,
            'filters' => [
                'year' => $year,
                'month' => $month,
            ],
        ]);
    }
}
