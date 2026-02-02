<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProviderSettlementController extends Controller
{
    public function index(Request $request): Response
    {
        $provider = auth()->user()->provider;

        $status = $request->input('status');

        $settlements = $provider->settlements()
            ->with(['booking.user', 'booking.status', 'status'])
            ->when($status, function ($query, $status) {
                $query->whereHas('status', function ($q) use ($status) {
                    $q->where('name', $status);
                });
            })
            ->orderByDesc('created_at')
            ->paginate(20);

        $pendingAmount = $provider->settlements()
            ->pending()
            ->sum('provider_payout_amount');

        $paidAmount = $provider->settlements()
            ->paid()
            ->sum('provider_payout_amount');

        return Inertia::render('provider/settlements/index', [
            'settlements' => $settlements,
            'summary' => [
                'pending_amount' => $pendingAmount,
                'paid_amount' => $paidAmount,
            ],
            'filters' => [
                'status' => $status,
            ],
        ]);
    }
}
