<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Review Model
 *
 * Reviews and ratings for providers
 */
class Review extends Model
{
    use HasFactory, HasUlids;

    /**
     * The table associated with the model.
     */
    protected $table = 'reviews';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'booking_id',
        'user_id',
        'provider_id',
        'rating',
        'review_text',
        'is_published',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'is_published' => 'boolean',
        ];
    }

    /**
     * Get the booking this review is for.
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Get the user who wrote this review.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the provider being reviewed.
     */
    public function provider(): BelongsTo
    {
        return $this->belongsTo(Provider::class);
    }

    /**
     * Scope a query to only include published reviews.
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    /**
     * Scope a query to filter by minimum rating.
     */
    public function scopeMinRating($query, int $rating)
    {
        return $query->where('rating', '>=', $rating);
    }

    /**
     * Boot method to update provider rating when review is created/updated.
     */
    protected static function boot()
    {
        parent::boot();

        static::created(function ($review) {
            if ($review->is_published) {
                $review->updateProviderRating();
            }
        });

        static::updated(function ($review) {
            if ($review->is_published || $review->wasChanged('is_published')) {
                $review->updateProviderRating();
            }
        });

        static::deleted(function ($review) {
            $review->updateProviderRating();
        });
    }

    /**
     * Update the provider's average rating and total reviews.
     */
    protected function updateProviderRating(): void
    {
        $provider = $this->provider;

        $stats = $provider->reviews()
            ->published()
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as total_reviews')
            ->first();

        $provider->update([
            'average_rating' => $stats->avg_rating ?? 0,
            'total_reviews' => $stats->total_reviews ?? 0,
        ]);
    }
}
