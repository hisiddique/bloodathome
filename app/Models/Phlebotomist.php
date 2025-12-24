<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Phlebotomist extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'name',
        'image',
        'rating',
        'experience',
        'price',
        'available',
        'bio',
        'reviews_count',
        'specialties',
        'service_area',
        'phone',
        'certifications',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'specialties' => 'array',
            'available' => 'boolean',
            'rating' => 'decimal:2',
            'price' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function scopeAvailable($query)
    {
        return $query->where('available', true);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }
}
