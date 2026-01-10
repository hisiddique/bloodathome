<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * CollectionType Model
 *
 * Lookup table for collection types
 * Values: Home Visit, Clinic
 */
class CollectionType extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'collection_types';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'icon_class',
        'display_order',
        'description',
    ];

    /**
     * Indicates if the model should be timestamped.
     */
    public $timestamps = false;

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'display_order' => 'integer',
        ];
    }

    /**
     * Get all bookings with this collection type.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'collection_type_id');
    }

    /**
     * Get all service collection mappings for this type.
     */
    public function serviceCollectionMappings(): HasMany
    {
        return $this->hasMany(ServiceCollectionMapping::class, 'collection_type_id');
    }
}
