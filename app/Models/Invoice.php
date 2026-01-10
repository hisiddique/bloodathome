<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Invoice Model
 *
 * Invoice records for payments
 */
class Invoice extends Model
{
    use HasFactory, HasUlids;

    /**
     * The table associated with the model.
     */
    protected $table = 'invoices';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'payment_id',
        'invoice_number',
        'billing_address',
        'subtotal_amount',
        'total_tax_amount',
        'grand_total',
        'pdf_storage_link',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'subtotal_amount' => 'decimal:2',
            'total_tax_amount' => 'decimal:2',
            'grand_total' => 'decimal:2',
        ];
    }

    /**
     * Get the payment this invoice is for.
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    /**
     * Generate a unique invoice number.
     */
    public static function generateInvoiceNumber(): string
    {
        $year = now()->year;
        $latest = static::whereYear('created_at', $year)->max('invoice_number');

        if ($latest) {
            $number = intval(substr($latest, -4)) + 1;
        } else {
            $number = 1;
        }

        return sprintf('INV-%d-%04d', $year, $number);
    }
}
