<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * ServiceCollectionMapping Model
 *
 * Links services to collection types with additional details
 */
class ServiceCollectionMapping extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'service_collection_mapping';

    /**
     * Indicates if the model should be timestamped.
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'service_id',
        'collection_type_id',
        'additional_cost',
        'description_html',
        'created_at',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'additional_cost' => 'decimal:2',
            'created_at' => 'datetime',
        ];
    }

    /**
     * Get the service this mapping belongs to.
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Get the collection type this mapping belongs to.
     */
    public function collectionType(): BelongsTo
    {
        return $this->belongsTo(CollectionType::class);
    }
}
