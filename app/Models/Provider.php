<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;

/**
 * Provider Model
 *
 * Phlebotomists, laboratories, and clinic locations
 * Maintains a 1:1 relationship with users table for authentication
 */
class Provider extends Model
{
    use HasFactory, HasUlids, Notifiable, SoftDeletes;

    /**
     * The table associated with the model.
     */
    protected $table = 'providers';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'type_id',
        'status_id',
        'provider_name',
        'address_line1',
        'address_line2',
        'town_city',
        'postcode',
        'latitude',
        'longitude',
        'location',
        'profile_image_url',
        'profile_thumbnail_url',
        'show_image_in_search',
        'bio',
        'experience_years',
        'average_rating',
        'total_reviews',
        'provider_notes',
        'dbs_certificate_path',
        'insurance_document_path',
        'rejection_reason',
        'approved_at',
        'approved_by',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'average_rating' => 'decimal:2',
            'total_reviews' => 'integer',
            'experience_years' => 'integer',
            'show_image_in_search' => 'boolean',
            'approved_at' => 'datetime',
        ];
    }

    /**
     * Get the user that owns this provider profile (1:1).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the provider type.
     */
    public function type(): BelongsTo
    {
        return $this->belongsTo(ProviderType::class, 'type_id');
    }

    /**
     * Get the provider status.
     */
    public function status(): BelongsTo
    {
        return $this->belongsTo(ProviderStatus::class, 'status_id');
    }

    /**
     * Get all services offered by this provider.
     */
    public function providerServices(): HasMany
    {
        return $this->hasMany(ProviderService::class);
    }

    /**
     * Get all availabilities for this provider.
     */
    public function availabilities(): HasMany
    {
        return $this->hasMany(ProviderAvailability::class);
    }

    /**
     * Get all service areas for this provider.
     */
    public function serviceAreas(): HasMany
    {
        return $this->hasMany(ProviderServiceArea::class);
    }

    /**
     * Get all qualifications for this provider.
     */
    public function qualifications(): HasMany
    {
        return $this->hasMany(ProviderQualification::class);
    }

    /**
     * Get all rate history for this provider.
     */
    public function rates(): HasMany
    {
        return $this->hasMany(ProviderRate::class);
    }

    /**
     * Get all clinic locations for this provider.
     */
    public function clinicLocations(): HasMany
    {
        return $this->hasMany(ClinicLocation::class);
    }

    /**
     * Get all bookings for this provider.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Get all reviews for this provider.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get all settlements for this provider.
     */
    public function settlements(): HasMany
    {
        return $this->hasMany(ProviderSettlement::class);
    }

    /**
     * Get the user who approved this provider.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
