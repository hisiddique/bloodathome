<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * BookingItem Model
 *
 * Line items for services in a booking
 */
class BookingItem extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'booking_items';

    /**
     * Indicates if the model should be timestamped.
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'booking_id',
        'catalog_id',
        'item_cost',
        'agreed_comm_percent',
        'created_at',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'item_cost' => 'decimal:2',
            'agreed_comm_percent' => 'decimal:2',
            'created_at' => 'datetime',
        ];
    }

    /**
     * Get the booking this item belongs to.
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Get the provider service (catalog entry) for this item.
     */
    public function providerService(): BelongsTo
    {
        return $this->belongsTo(ProviderService::class, 'catalog_id');
    }

    /**
     * Calculate the commission amount for this item.
     */
    public function getCommissionAmount(): float
    {
        return round($this->item_cost * ($this->agreed_comm_percent / 100), 2);
    }

    /**
     * Calculate the provider payout for this item.
     */
    public function getProviderPayout(): float
    {
        return round($this->item_cost - $this->getCommissionAmount(), 2);
    }
}
