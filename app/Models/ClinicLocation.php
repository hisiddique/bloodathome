<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * ClinicLocation Model
 *
 * Physical clinic locations for laboratory and clinic providers
 */
class ClinicLocation extends Model
{
    use HasFactory, HasUlids;

    /**
     * The table associated with the model.
     */
    protected $table = 'clinic_locations';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'provider_id',
        'name',
        'address_line1',
        'address_line2',
        'town_city',
        'postcode',
        'latitude',
        'longitude',
        'phone',
        'email',
        'opening_hours',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'opening_hours' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the provider this clinic location belongs to.
     */
    public function provider(): BelongsTo
    {
        return $this->belongsTo(Provider::class);
    }

    /**
     * Scope a query to only include active clinic locations.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
