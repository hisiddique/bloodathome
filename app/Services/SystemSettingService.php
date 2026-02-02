<?php

namespace App\Services;

class SystemSettingService
{
    /**
     * Get a system setting value by key.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        // For now, return defaults. This will be expanded later to use a database table
        return match ($key) {
            'branding.app_name' => config('app.name', 'BloodAtHome Admin'),
            'branding.logo' => null,
            'branding.favicon' => null,
            default => $default,
        };
    }

    /**
     * Set a system setting value by key.
     */
    public static function set(string $key, mixed $value): void
    {
        // This will be implemented later to save to database
    }
}
