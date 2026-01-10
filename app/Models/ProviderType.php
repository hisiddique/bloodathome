<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * ProviderType Model
 *
 * Lookup table for provider types
 * Values: Individual, Laboratory, Clinic
 */
class ProviderType extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'provider_types';

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
     * Get all providers of this type.
     */
    public function providers(): HasMany
    {
        return $this->hasMany(Provider::class, 'type_id');
    }
}
