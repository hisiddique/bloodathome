<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * PaymentTaxBreakdown Model
 *
 * Tax calculation details for payments
 */
class PaymentTaxBreakdown extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'payment_tax_breakdown';

    /**
     * Indicates if the model should be timestamped.
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'payment_id',
        'tax_type_name',
        'tax_percentage',
        'tax_amount_calculated',
        'created_at',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'tax_percentage' => 'decimal:2',
            'tax_amount_calculated' => 'decimal:2',
            'created_at' => 'datetime',
        ];
    }

    /**
     * Get the payment this tax breakdown belongs to.
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }
}
