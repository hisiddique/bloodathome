<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * ProviderServiceArea Model
 *
 * Geographic service areas and travel fees
 */
class ProviderServiceArea extends Model
{
    use HasFactory, HasUlids;

    /**
     * The table associated with the model.
     */
    protected $table = 'provider_service_areas';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'provider_id',
        'postcode_prefix',
        'max_distance_miles',
        'additional_travel_fee',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'max_distance_miles' => 'decimal:2',
            'additional_travel_fee' => 'decimal:2',
        ];
    }

    /**
     * Get the provider this service area belongs to.
     */
    public function provider(): BelongsTo
    {
        return $this->belongsTo(Provider::class);
    }
}
