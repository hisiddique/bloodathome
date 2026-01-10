<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * ServiceActiveStatus Model
 *
 * Lookup table for service active status types
 * Values: Active, Inactive, Out of Stock, Discontinued
 */
class ServiceActiveStatus extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'service_active_statuses';

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
     * Get all provider services with this status.
     */
    public function providerServices(): HasMany
    {
        return $this->hasMany(ProviderService::class, 'status_id');
    }
}
