<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

/**
 * SystemSetting Model
 *
 * System-wide configuration settings
 */
class SystemSetting extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'system_settings';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'description',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'value' => 'string',
        ];
    }

    /**
     * Get a setting value by key.
     */
    public static function getValue(string $key, mixed $default = null): mixed
    {
        try {
            if (! Schema::hasTable('system_settings')) {
                return $default;
            }

            $setting = static::where('key', $key)->first();

            if (! $setting) {
                return $default;
            }

            return match ($setting->type) {
                'boolean' => filter_var($setting->value, FILTER_VALIDATE_BOOLEAN),
                'integer' => (int) $setting->value,
                'float' => (float) $setting->value,
                'array', 'json' => json_decode($setting->value, true),
                default => $setting->value,
            };
        } catch (\Throwable) {
            return $default;
        }
    }

    /**
     * Set a setting value by key.
     */
    public static function setValue(string $key, mixed $value, string $type = 'string', string $group = 'general'): void
    {
        $valueToStore = is_array($value) ? json_encode($value) : $value;

        static::updateOrCreate(
            ['key' => $key],
            [
                'value' => $valueToStore,
                'type' => $type,
                'group' => $group,
            ]
        );
    }
}
