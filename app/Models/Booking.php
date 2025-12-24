<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Booking extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'patient_id',
        'phlebotomist_id',
        'phlebotomist_name',
        'phlebotomist_image',
        'blood_test_id',
        'appointment_date',
        'time_slot',
        'address',
        'postcode',
        'latitude',
        'longitude',
        'visit_type',
        'status',
        'price',
        'patient_details',
    ];

    protected function casts(): array
    {
        return [
            'patient_details' => 'array',
            'appointment_date' => 'date',
            'price' => 'decimal:2',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function phlebotomist(): BelongsTo
    {
        return $this->belongsTo(Phlebotomist::class);
    }

    public function bloodTest(): BelongsTo
    {
        return $this->belongsTo(BloodTest::class);
    }

    public function chatMessages(): HasMany
    {
        return $this->hasMany(ChatMessage::class);
    }
}
