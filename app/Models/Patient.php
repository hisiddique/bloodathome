<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Patient Model
 *
 * Patient-specific profile information with health and medical details
 * Maintains a 1:1 relationship with users table
 */
class Patient extends Model
{
    use HasFactory, HasUlids, SoftDeletes;

    /**
     * The table associated with the model.
     */
    protected $table = 'patients';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'date_of_birth',
        'address_line1',
        'address_line2',
        'town_city',
        'postcode',
        'nhs_number',
        'known_blood_type',
        'known_allergies',
        'current_medications',
        'medical_conditions',
        'internal_notes',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
        ];
    }

    /**
     * Get the user that owns this patient profile (1:1).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all bookings for this patient.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'user_id', 'user_id');
    }
}
