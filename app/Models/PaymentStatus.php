<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * PaymentStatus Model
 *
 * Lookup table for payment status types
 * Values: Pending, Completed, Failed, Refunded
 */
class PaymentStatus extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'payment_statuses';

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
     * Get all payments with this status.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'payment_status_id');
    }
}
