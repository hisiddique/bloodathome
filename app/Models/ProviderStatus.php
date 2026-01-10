<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * ProviderStatus Model
 *
 * Lookup table for provider status types
 * Values: Active, InActive
 */
class ProviderStatus extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'provider_statuses';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * Indicates if the model should be timestamped.
     */
    public $timestamps = false;

    /**
     * Get all providers with this status.
     */
    public function providers(): HasMany
    {
        return $this->hasMany(Provider::class, 'status_id');
    }
}
