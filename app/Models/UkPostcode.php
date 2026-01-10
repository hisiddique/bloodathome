<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * UkPostcode Model
 *
 * UK postcode reference data for geographic lookups
 */
class UkPostcode extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'uk_postcodes';

    /**
     * Indicates if the model should be timestamped.
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'postcode',
        'latitude',
        'longitude',
        'district',
        'ward',
        'county',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
        ];
    }

    /**
     * Scope a query to search by postcode.
     */
    public function scopeByPostcode($query, string $postcode)
    {
        return $query->where('postcode', 'LIKE', strtoupper($postcode).'%');
    }

    /**
     * Scope a query to search by district.
     */
    public function scopeByDistrict($query, string $district)
    {
        return $query->where('district', $district);
    }

    /**
     * Calculate distance between two coordinates (in miles).
     */
    public static function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 3959; // miles

        $latDiff = deg2rad($lat2 - $lat1);
        $lonDiff = deg2rad($lon2 - $lon1);

        $a = sin($latDiff / 2) * sin($latDiff / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($lonDiff / 2) * sin($lonDiff / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return round($earthRadius * $c, 2);
    }
}
