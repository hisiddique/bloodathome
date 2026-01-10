<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * UserPaymentMethod Model
 *
 * Saved payment methods (Stripe integration)
 */
class UserPaymentMethod extends Model
{
    use HasFactory, HasUlids;

    /**
     * The table associated with the model.
     */
    protected $table = 'user_payment_methods';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'stripe_payment_method_id',
        'stripe_customer_id',
        'card_brand',
        'card_last_four',
        'card_exp_month',
        'card_exp_year',
        'is_default',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
            'card_exp_month' => 'integer',
            'card_exp_year' => 'integer',
        ];
    }

    /**
     * Get the user that owns this payment method.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to only include default payment methods.
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Check if the card is expired.
     */
    public function isExpired(): bool
    {
        $now = now();

        return $this->card_exp_year < $now->year ||
               ($this->card_exp_year == $now->year && $this->card_exp_month < $now->month);
    }
}
