<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * PaymentMethod Model
 *
 * Lookup table for payment method types
 * Values: GPay, MasterCard, CreditCard, BankPortal
 */
class PaymentMethod extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'payment_methods';

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
     * Get all payments using this method.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'method_id');
    }
}
