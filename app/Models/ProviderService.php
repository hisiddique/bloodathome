<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * ProviderService Model
 *
 * Service offerings by providers with pricing and commission
 * Acts as a pivot table with additional data
 */
class ProviderService extends Model
{
    use HasFactory, HasUlids;

    /**
     * The table associated with the model.
     */
    protected $table = 'provider_services';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'provider_id',
        'service_id',
        'base_cost',
        'agreed_commission_percent',
        'start_date',
        'end_date',
        'status_id',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'base_cost' => 'decimal:2',
            'agreed_commission_percent' => 'decimal:2',
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    /**
     * Get the provider that offers this service.
     */
    public function provider(): BelongsTo
    {
        return $this->belongsTo(Provider::class);
    }

    /**
     * Get the service being offered.
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Get the service active status.
     */
    public function status(): BelongsTo
    {
        return $this->belongsTo(ServiceActiveStatus::class, 'status_id');
    }

    /**
     * Get all booking items for this provider service.
     */
    public function bookingItems(): HasMany
    {
        return $this->hasMany(BookingItem::class, 'catalog_id');
    }

    /**
     * Scope a query to only include active services.
     */
    public function scopeActive($query)
    {
        return $query->whereHas('status', function ($q) {
            $q->where('name', 'Active');
        });
    }

    /**
     * Scope a query to only include current services.
     */
    public function scopeCurrent($query)
    {
        return $query->where('start_date', '<=', now())
            ->where(function ($q) {
                $q->whereNull('end_date')
                    ->orWhere('end_date', '>=', now());
            });
    }
}
