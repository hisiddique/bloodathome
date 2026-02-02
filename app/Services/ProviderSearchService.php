<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Provider;
use App\Models\ProviderAvailability;
use App\Models\SystemSetting;
use Carbon\Carbon;
use Illuminate\Support\Collection;

/**
 * ProviderSearchService
 *
 * Service for searching and filtering providers based on location and availability
 */
class ProviderSearchService
{
    /**
     * Search for providers near a given location.
     */
    public function searchNearby(float $lat, float $lng, ?float $radiusKm = null, array $filters = []): Collection
    {
        $radius = $radiusKm ?? SystemSetting::getValue('platform.provider_search_radius_km', 10);

        // Calculate bounding box for initial database filtering
        // ~111km per degree of latitude
        // Longitude varies by latitude: 111km * cos(latitude)
        $latDelta = $radius / 111.0;
        $lngDelta = $radius / (111.0 * cos(deg2rad($lat)));

        $providers = Provider::query()
            ->whereHas('status', function ($query) {
                $query->where('name', 'Active');
            })
            // Add bounding box filter at database level
            ->whereBetween('latitude', [$lat - $latDelta, $lat + $latDelta])
            ->whereBetween('longitude', [$lng - $lngDelta, $lng + $lngDelta])
            ->with(['user', 'type', 'status', 'providerServices.service', 'serviceAreas', 'clinicLocations'])
            ->get()
            ->map(function ($provider) use ($lat, $lng) {
                $distance = $this->calculateDistance(
                    $lat,
                    $lng,
                    (float) $provider->latitude,
                    (float) $provider->longitude
                );

                $provider->distance_km = round($distance, 2);

                return $provider;
            })
            ->filter(function ($provider) use ($radius) {
                // Final precise filter (bounding box is square, we want circle)
                return $provider->distance_km <= $radius;
            })
            ->sortBy('distance_km')
            ->values();

        if (isset($filters['service_id'])) {
            $providers = $this->filterByService($providers, $filters['service_id']);
        }

        if (isset($filters['collection_type'])) {
            $providers = $this->filterByCollectionType($providers, $filters['collection_type']);
        }

        return $providers;
    }

    /**
     * Calculate distance between two coordinates using Haversine formula.
     */
    public function calculateDistance(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371;

        $latDelta = deg2rad($lat2 - $lat1);
        $lngDelta = deg2rad($lng2 - $lng1);

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($lngDelta / 2) * sin($lngDelta / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Get available time slots for a provider on a specific date.
     */
    public function getAvailableSlots(Provider $provider, Carbon $date): array
    {
        $dayOfWeek = $date->dayOfWeek;

        $availability = ProviderAvailability::where('provider_id', $provider->id)
            ->where('is_available', true)
            ->where(function ($query) use ($date, $dayOfWeek) {
                $query->where(function ($q) use ($date) {
                    $q->whereNotNull('specific_date')
                        ->whereDate('specific_date', $date->format('Y-m-d'));
                })
                    ->orWhere(function ($q) use ($dayOfWeek) {
                        $q->whereNotNull('day_of_week')
                            ->where('day_of_week', $dayOfWeek)
                            ->whereNull('specific_date');
                    });
            })
            ->orderBy('start_time')
            ->get();

        if ($availability->isEmpty()) {
            return [];
        }

        $bookedSlots = Booking::where('provider_id', $provider->id)
            ->whereDate('scheduled_date', $date->format('Y-m-d'))
            ->whereHas('status', function ($query) {
                $query->whereIn('name', ['Pending', 'Confirmed']);
            })
            ->pluck('time_slot')
            ->toArray();

        $slots = [];

        foreach ($availability as $slot) {
            $startTime = Carbon::parse($slot->start_time);
            $endTime = Carbon::parse($slot->end_time);

            while ($startTime->lt($endTime)) {
                $timeSlot = $startTime->format('H:i');
                $isAvailable = ! in_array($timeSlot, $bookedSlots);

                $slots[] = [
                    'time' => $timeSlot,
                    'available' => $isAvailable,
                ];

                $startTime->addMinutes(30);
            }
        }

        usort($slots, function ($a, $b) {
            return strcmp($a['time'], $b['time']);
        });

        return array_values(array_unique($slots, SORT_REGULAR));
    }

    /**
     * Filter providers by service offering.
     */
    public function filterByService(Collection $providers, string $serviceId): Collection
    {
        return $providers->filter(function ($provider) use ($serviceId) {
            // Filter using eager-loaded relationship (no additional queries)
            return $provider->providerServices
                ->contains(function ($ps) use ($serviceId) {
                    return $ps->service_id === $serviceId
                        && $ps->service
                        && $ps->service->is_active;
                });
        })->values();
    }

    /**
     * Filter providers by collection type support.
     */
    public function filterByCollectionType(Collection $providers, string $collectionType): Collection
    {
        return $providers->filter(function ($provider) use ($collectionType) {
            if ($collectionType === 'Home Visit') {
                // Filter using eager-loaded relationship (no additional queries)
                return $provider->serviceAreas->isNotEmpty();
            }

            if ($collectionType === 'Clinic') {
                // Filter using eager-loaded relationship (no additional queries)
                return $provider->clinicLocations->isNotEmpty();
            }

            return true;
        })->values();
    }
}
