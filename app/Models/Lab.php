<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lab extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'image',
        'rating',
        'address',
        'postcode',
        'latitude',
        'longitude',
        'base_price',
        'available',
    ];

    protected function casts(): array
    {
        return [
            'available' => 'boolean',
            'rating' => 'decimal:2',
            'base_price' => 'decimal:2',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
        ];
    }

    public function scopeAvailable($query)
    {
        return $query->where('available', true);
    }
}
