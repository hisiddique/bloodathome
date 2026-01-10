<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * VerificationStatus Model
 *
 * Lookup table for verification status types
 * Values: Pending, Verified, Rejected, Expired
 */
class VerificationStatus extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'verification_statuses';

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
     * Get all provider qualifications with this verification status.
     */
    public function providerQualifications(): HasMany
    {
        return $this->hasMany(ProviderQualification::class, 'status_id');
    }
}
