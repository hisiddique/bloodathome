<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * BookingStatus Model
 *
 * Lookup table for booking status types
 * Values: Pending, Confirmed, Completed, Cancelled
 */
class BookingStatus extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'booking_statuses';

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
     * Get all bookings with this status.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'status_id');
    }
}
