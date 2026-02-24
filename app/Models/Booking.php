<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Booking Model
 *
 * Main booking records for patient appointments
 */
class Booking extends Model
{
    use HasFactory, HasUlids, SoftDeletes;

    /**
     * The table associated with the model.
     */
    protected $table = 'bookings';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'dependent_id',
        'provider_id',
        'status_id',
        'confirmation_number',
        'collection_type_id',
        'nhs_number',
        'scheduled_date',
        'time_slot',
        'service_address_line1',
        'service_address_line2',
        'service_town_city',
        'service_postcode',
        'grand_total_cost',
        'subtotal_amount',
        'service_fee_percent',
        'service_fee_amount',
        'vat_percent',
        'vat_amount',
        'discount_amount',
        'promo_code_id',
        'stripe_payment_intent_id',
        'visit_instructions',
        'patient_notes',
        'guardian_name',
        'guardian_confirmed',
        'draft_token',
        'draft_expires_at',
        'cancelled_at',
        'cancellation_reason',
        // Guest booking fields
        'guest_email',
        'guest_name',
        'guest_phone',
        'is_guest_booking',
        'consented_at',
        'consent_version',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'scheduled_date' => 'date',
            'grand_total_cost' => 'decimal:2',
            'subtotal_amount' => 'decimal:2',
            'service_fee_percent' => 'decimal:2',
            'service_fee_amount' => 'decimal:2',
            'vat_percent' => 'decimal:2',
            'vat_amount' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'guardian_confirmed' => 'boolean',
            'draft_expires_at' => 'datetime',
            'consented_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    /**
     * Get the user (patient) who made this booking.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the dependent for this booking (if booking is for a dependent).
     */
    public function dependent(): BelongsTo
    {
        return $this->belongsTo(Dependent::class);
    }

    /**
     * Get the provider for this booking.
     */
    public function provider(): BelongsTo
    {
        return $this->belongsTo(Provider::class);
    }

    /**
     * Get the booking status.
     */
    public function status(): BelongsTo
    {
        return $this->belongsTo(BookingStatus::class, 'status_id');
    }

    /**
     * Get the collection type.
     */
    public function collectionType(): BelongsTo
    {
        return $this->belongsTo(CollectionType::class, 'collection_type_id');
    }

    /**
     * Get the promo code used for this booking.
     */
    public function promoCode(): BelongsTo
    {
        return $this->belongsTo(PromoCode::class, 'promo_code_id');
    }

    /**
     * Get all items in this booking.
     */
    public function items(): HasMany
    {
        return $this->hasMany(BookingItem::class);
    }

    /**
     * Get the payment for this booking.
     */
    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    /**
     * Get the settlement for this booking.
     */
    public function settlement(): HasOne
    {
        return $this->hasOne(ProviderSettlement::class);
    }

    /**
     * Get the review for this booking.
     */
    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }

    /**
     * Get the chat conversation for this booking.
     */
    public function conversation(): HasOne
    {
        return $this->hasOne(ChatConversation::class);
    }

    /**
     * Scope a query to only include confirmed bookings.
     */
    public function scopeConfirmed($query)
    {
        return $query->whereHas('status', function ($q) {
            $q->where('name', 'Confirmed');
        });
    }

    /**
     * Scope a query to only include completed bookings.
     */
    public function scopeCompleted($query)
    {
        return $query->whereHas('status', function ($q) {
            $q->where('name', 'Completed');
        });
    }

    /**
     * Scope a query to only include cancelled bookings.
     */
    public function scopeCancelled($query)
    {
        return $query->whereHas('status', function ($q) {
            $q->where('name', 'Cancelled');
        });
    }

    /**
     * Check if booking is cancelled.
     */
    public function isCancelled(): bool
    {
        return ! is_null($this->cancelled_at);
    }

    /**
     * Calculate full pricing breakdown from a subtotal using current system settings.
     *
     * @return array{subtotal_amount: float, service_fee_percent: float, service_fee_amount: float, vat_percent: float, vat_amount: float, discount_amount: float, grand_total_cost: float}
     */
    public static function calculatePricing(float $subtotal, float $discountAmount = 0): array
    {
        $serviceFeePercent = (float) SystemSetting::getValue('platform.service_fee_percentage', 5);
        $vatPercent = (float) SystemSetting::getValue('platform.vat_percentage', 20);

        $serviceFeeAmount = round($subtotal * ($serviceFeePercent / 100), 2);
        $vatAmount = round(($subtotal + $serviceFeeAmount) * ($vatPercent / 100), 2);
        $grandTotal = round($subtotal + $serviceFeeAmount + $vatAmount - $discountAmount, 2);

        return [
            'subtotal_amount' => $subtotal,
            'service_fee_percent' => $serviceFeePercent,
            'service_fee_amount' => $serviceFeeAmount,
            'vat_percent' => $vatPercent,
            'vat_amount' => $vatAmount,
            'discount_amount' => $discountAmount,
            'grand_total_cost' => $grandTotal,
        ];
    }

    /**
     * Generate a unique confirmation number.
     */
    public static function generateConfirmationNumber(): string
    {
        $year = now()->year;
        $latest = static::whereYear('created_at', $year)->max('confirmation_number');

        if ($latest) {
            $number = intval(substr($latest, -6)) + 1;
        } else {
            $number = 1;
        }

        return sprintf('BAH-%d-%06d', $year, $number);
    }
}
