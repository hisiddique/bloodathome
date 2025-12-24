<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BloodTest extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'description',
        'home_price',
        'clinic_price',
        'category',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
            'home_price' => 'decimal:2',
            'clinic_price' => 'decimal:2',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }
}
