<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * ProviderSettlement Model
 *
 * Provider payment settlements per booking
 */
class ProviderSettlement extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'provider_settlements';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'booking_id',
        'provider_id',
        'collected_amount',
        'commission_percentage',
        'commission_amount',
        'provider_payout_amount',
        'settlement_status_id',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'collected_amount' => 'decimal:2',
            'commission_percentage' => 'decimal:2',
            'commission_amount' => 'decimal:2',
            'provider_payout_amount' => 'decimal:2',
        ];
    }

    /**
     * Get the booking this settlement is for.
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Get the provider receiving this settlement.
     */
    public function provider(): BelongsTo
    {
        return $this->belongsTo(Provider::class);
    }

    /**
     * Get the settlement status.
     */
    public function status(): BelongsTo
    {
        return $this->belongsTo(SettlementStatus::class, 'settlement_status_id');
    }

    /**
     * Scope a query to only include pending settlements.
     */
    public function scopePending($query)
    {
        return $query->whereHas('status', function ($q) {
            $q->where('name', 'Pending');
        });
    }

    /**
     * Scope a query to only include paid settlements.
     */
    public function scopePaid($query)
    {
        return $query->whereHas('status', function ($q) {
            $q->where('name', 'Paid');
        });
    }
}
