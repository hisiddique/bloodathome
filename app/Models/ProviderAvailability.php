<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * ProviderAvailability Model
 *
 * Recurring and one-time provider availability windows
 */
class ProviderAvailability extends Model
{
    use HasFactory, HasUlids;

    /**
     * The table associated with the model.
     */
    protected $table = 'provider_availabilities';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'provider_id',
        'day_of_week',
        'specific_date',
        'start_time',
        'end_time',
        'is_available',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'day_of_week' => 'integer',
            'specific_date' => 'date',
            'is_available' => 'boolean',
        ];
    }

    /**
     * Get the provider this availability belongs to.
     */
    public function provider(): BelongsTo
    {
        return $this->belongsTo(Provider::class);
    }

    /**
     * Scope a query to only include available time slots.
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    /**
     * Scope a query to only include recurring availabilities.
     */
    public function scopeRecurring($query)
    {
        return $query->whereNotNull('day_of_week')->whereNull('specific_date');
    }

    /**
     * Scope a query to only include specific date availabilities.
     */
    public function scopeSpecificDate($query)
    {
        return $query->whereNotNull('specific_date')->whereNull('day_of_week');
    }
}
