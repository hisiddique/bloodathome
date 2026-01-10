<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * BookingConsent Model
 *
 * Consent records for bookings
 */
class BookingConsent extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'booking_consents';

    /**
     * Indicates if the model should be timestamped.
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'booking_id',
        'consent_type',
        'consent_text',
        'consented_at',
        'ip_address',
        'user_agent',
        'created_at',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'consented_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    /**
     * Get the booking this consent belongs to.
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Consent type constants.
     */
    const TYPE_TERMS = 'terms';

    const TYPE_CANCELLATION_POLICY = 'cancellation_policy';

    const TYPE_CONTACT_CONSENT = 'contact_consent';

    const TYPE_GUARDIAN_CONSENT = 'guardian_consent';

    /**
     * Get all available consent types.
     */
    public static function getConsentTypes(): array
    {
        return [
            self::TYPE_TERMS,
            self::TYPE_CANCELLATION_POLICY,
            self::TYPE_CONTACT_CONSENT,
            self::TYPE_GUARDIAN_CONSENT,
        ];
    }
}
