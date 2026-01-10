<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * ProviderQualification Model
 *
 * Professional qualifications and credentials for providers
 */
class ProviderQualification extends Model
{
    use HasFactory, HasUlids;

    /**
     * The table associated with the model.
     */
    protected $table = 'provider_qualifications';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'provider_id',
        'credential_name',
        'issuing_body',
        'license_number',
        'expiry_date',
        'status_id',
        'document_url',
        'verified_by_agent',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'expiry_date' => 'date',
        ];
    }

    /**
     * Get the provider this qualification belongs to.
     */
    public function provider(): BelongsTo
    {
        return $this->belongsTo(Provider::class);
    }

    /**
     * Get the verification status.
     */
    public function status(): BelongsTo
    {
        return $this->belongsTo(VerificationStatus::class, 'status_id');
    }

    /**
     * Scope a query to only include verified qualifications.
     */
    public function scopeVerified($query)
    {
        return $query->whereHas('status', function ($q) {
            $q->where('name', 'Verified');
        });
    }

    /**
     * Scope a query to only include non-expired qualifications.
     */
    public function scopeNotExpired($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expiry_date')
                ->orWhere('expiry_date', '>=', now());
        });
    }
}
