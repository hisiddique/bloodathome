<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * BookingDraft Model
 *
 * Draft bookings for multi-step booking process
 */
class BookingDraft extends Model
{
    use HasFactory, HasUlids;

    /**
     * The table associated with the model.
     */
    protected $table = 'booking_drafts';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'session_token',
        'current_step',
        'step_data',
        'expires_at',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'current_step' => 'integer',
            'step_data' => 'array',
            'expires_at' => 'datetime',
        ];
    }

    /**
     * Get the user who owns this draft (nullable for guests).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to only include non-expired drafts.
     */
    public function scopeNotExpired($query)
    {
        return $query->where('expires_at', '>', now());
    }

    /**
     * Scope a query to only include expired drafts.
     */
    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<=', now());
    }

    /**
     * Check if the draft is expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at <= now();
    }

    /**
     * Update the step data for a specific step.
     */
    public function updateStepData(int $step, array $data): void
    {
        $stepData = $this->step_data ?? [];
        $stepData["step_{$step}"] = $data;
        $this->step_data = $stepData;
        $this->current_step = $step;
        $this->save();
    }

    /**
     * Get data for a specific step.
     */
    public function getStepData(int $step): ?array
    {
        return $this->step_data["step_{$step}"] ?? null;
    }
}
