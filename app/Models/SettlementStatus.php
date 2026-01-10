<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * SettlementStatus Model
 *
 * Lookup table for settlement status types
 * Values: Pending, Processing, Paid
 */
class SettlementStatus extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'settlement_statuses';

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
     * Get all provider settlements with this status.
     */
    public function providerSettlements(): HasMany
    {
        return $this->hasMany(ProviderSettlement::class, 'settlement_status_id');
    }
}
