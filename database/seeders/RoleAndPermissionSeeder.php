<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // Booking permissions
            'create booking',
            'view booking',
            'update booking',
            'cancel booking',
            'view all bookings',

            // Provider permissions
            'create provider',
            'view provider',
            'update provider',
            'delete provider',
            'view all providers',

            // Patient permissions
            'view patient',
            'update patient',
            'view all patients',

            // Service permissions
            'create service',
            'view service',
            'update service',
            'delete service',

            // Payment permissions
            'create payment',
            'view payment',
            'refund payment',
            'view all payments',

            // Settlement permissions
            'view settlement',
            'process settlement',
            'view all settlements',

            // Review permissions
            'create review',
            'view review',
            'publish review',
            'delete review',

            // Admin permissions
            'manage users',
            'manage roles',
            'manage permissions',
            'view audit logs',
            'manage system settings',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions

        // Patient role
        $patientRole = Role::create(['name' => 'patient']);
        $patientRole->givePermissionTo([
            'create booking',
            'view booking',
            'cancel booking',
            'view patient',
            'update patient',
            'create payment',
            'view payment',
            'create review',
            'view review',
        ]);

        // Provider role
        $providerRole = Role::create(['name' => 'provider']);
        $providerRole->givePermissionTo([
            'view booking',
            'update booking',
            'view provider',
            'update provider',
            'view payment',
            'view settlement',
            'view review',
        ]);

        // Admin role (has all permissions)
        $adminRole = Role::create(['name' => 'admin']);
        $adminRole->givePermissionTo(Permission::all());
    }
}
