<?php

namespace App\Filament\Widgets;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Provider;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverviewWidget extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $currentMonth = now()->startOfMonth();
        $previousMonth = now()->subMonth()->startOfMonth();

        // Total Users (patients with patient role) - specify web guard
        $totalPatients = User::role('patient', 'web')->count();
        $previousPatients = User::role('patient', 'web')
            ->where('created_at', '<', $currentMonth)
            ->count();
        $patientGrowth = $previousPatients > 0
            ? round((($totalPatients - $previousPatients) / $previousPatients) * 100, 1)
            : 0;

        // Total Active Providers
        $activeProviders = Provider::whereHas('status', function ($query) {
            $query->where('name', 'Active');
        })->count();
        $previousActiveProviders = Provider::whereHas('status', function ($query) {
            $query->where('name', 'Active');
        })->where('created_at', '<', $currentMonth)->count();
        $providerGrowth = $previousActiveProviders > 0
            ? round((($activeProviders - $previousActiveProviders) / $previousActiveProviders) * 100, 1)
            : 0;

        // Total Bookings This Month
        $bookingsThisMonth = Booking::whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->count();
        $bookingsLastMonth = Booking::whereYear('created_at', $previousMonth->year)
            ->whereMonth('created_at', $previousMonth->month)
            ->count();
        $bookingGrowth = $bookingsLastMonth > 0
            ? round((($bookingsThisMonth - $bookingsLastMonth) / $bookingsLastMonth) * 100, 1)
            : 0;

        // Revenue This Month
        $revenueThisMonth = Payment::completed()
            ->whereYear('payment_date', now()->year)
            ->whereMonth('payment_date', now()->month)
            ->sum('amount');
        $revenueLastMonth = Payment::completed()
            ->whereYear('payment_date', $previousMonth->year)
            ->whereMonth('payment_date', $previousMonth->month)
            ->sum('amount');
        $revenueGrowth = $revenueLastMonth > 0
            ? round((($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100, 1)
            : 0;

        return [
            Stat::make('Total Patients', number_format($totalPatients))
                ->description($patientGrowth >= 0 ? "{$patientGrowth}% increase" : "{$patientGrowth}% decrease")
                ->descriptionIcon($patientGrowth >= 0 ? 'heroicon-m-arrow-trending-up' : 'heroicon-m-arrow-trending-down')
                ->color($patientGrowth >= 0 ? 'success' : 'danger')
                ->chart([7, 4, 10, 5, 15, 4, 17]),

            Stat::make('Active Providers', number_format($activeProviders))
                ->description($providerGrowth >= 0 ? "{$providerGrowth}% increase" : "{$providerGrowth}% decrease")
                ->descriptionIcon($providerGrowth >= 0 ? 'heroicon-m-arrow-trending-up' : 'heroicon-m-arrow-trending-down')
                ->color($providerGrowth >= 0 ? 'success' : 'danger')
                ->chart([3, 2, 5, 3, 8, 2, 10]),

            Stat::make('Bookings This Month', number_format($bookingsThisMonth))
                ->description($bookingGrowth >= 0 ? "{$bookingGrowth}% increase" : "{$bookingGrowth}% decrease")
                ->descriptionIcon($bookingGrowth >= 0 ? 'heroicon-m-arrow-trending-up' : 'heroicon-m-arrow-trending-down')
                ->color($bookingGrowth >= 0 ? 'success' : 'danger')
                ->chart([10, 20, 15, 30, 25, 40, 35]),

            Stat::make('Revenue This Month', '£'.number_format($revenueThisMonth, 2))
                ->description($revenueGrowth >= 0 ? "{$revenueGrowth}% increase" : "{$revenueGrowth}% decrease")
                ->descriptionIcon($revenueGrowth >= 0 ? 'heroicon-m-arrow-trending-up' : 'heroicon-m-arrow-trending-down')
                ->color($revenueGrowth >= 0 ? 'success' : 'danger')
                ->chart([100, 200, 150, 300, 250, 400, 350]),
        ];
    }
}
