<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * AuditLog Model
 *
 * Audit trail for tracking changes across the system
 */
class AuditLog extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'audit_log';

    /**
     * Indicates if the model should be timestamped.
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'action_type',
        'model_name',
        'record_id',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
        'occurred_at',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'old_values' => 'array',
            'new_values' => 'array',
            'occurred_at' => 'datetime',
        ];
    }

    /**
     * Get the user who performed this action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Action type constants.
     */
    const ACTION_CREATE = 'create';

    const ACTION_UPDATE = 'update';

    const ACTION_DELETE = 'delete';

    const ACTION_LOGIN = 'login';

    const ACTION_LOGOUT = 'logout';

    const ACTION_PAYMENT = 'payment';

    const ACTION_REFUND = 'refund';

    /**
     * Scope a query to filter by action type.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('action_type', $type);
    }

    /**
     * Scope a query to filter by model name.
     */
    public function scopeForModel($query, string $modelName)
    {
        return $query->where('model_name', $modelName);
    }

    /**
     * Scope a query to filter by record ID.
     */
    public function scopeForRecord($query, string $recordId)
    {
        return $query->where('record_id', $recordId);
    }

    /**
     * Scope a query to filter by user.
     */
    public function scopeByUser($query, string $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Log an audit event.
     */
    public static function log(
        ?string $userId,
        string $actionType,
        string $modelName,
        ?string $recordId = null,
        ?array $oldValues = null,
        ?array $newValues = null
    ): self {
        return static::create([
            'user_id' => $userId,
            'action_type' => $actionType,
            'model_name' => $modelName,
            'record_id' => $recordId,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'occurred_at' => now(),
        ]);
    }
}
