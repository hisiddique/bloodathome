<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * PromoCodeUsage Model
 *
 * Tracking of promo code usage by users
 */
class PromoCodeUsage extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'promo_code_usages';

    /**
     * Indicates if the model should be timestamped.
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'promo_code_id',
        'user_id',
        'booking_id',
        'discount_applied',
        'used_at',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'discount_applied' => 'decimal:2',
            'used_at' => 'datetime',
        ];
    }

    /**
     * Get the promo code that was used.
     */
    public function promoCode(): BelongsTo
    {
        return $this->belongsTo(PromoCode::class);
    }

    /**
     * Get the user who used the promo code.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the booking where the promo code was used.
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
