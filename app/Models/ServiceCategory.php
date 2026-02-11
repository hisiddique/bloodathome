<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * ServiceCategory Model
 *
 * Lookup table for service categories
 * Values: Blood Test, X-Ray, ECG, Ultrasound, General Health Check
 */
class ServiceCategory extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'service_categories';

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
     * Get all services in this category.
     */
    public function services(): HasMany
    {
        return $this->hasMany(Service::class, 'service_category_id');
    }
}
