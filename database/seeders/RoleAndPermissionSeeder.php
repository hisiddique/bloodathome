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
            // Admin permissions
            'view_admin_dashboard',
            'manage_users',
            'manage_providers',
            'approve_providers',
            'manage_bookings',
            'manage_services',
            'manage_payments',
            'process_refunds',
            'manage_settlements',
            'moderate_chat',
            'moderate_reviews',
            'manage_settings',
            'view_audit_logs',

            // Provider permissions
            'view_provider_dashboard',
            'manage_own_services',
            'manage_own_availability',
            'view_own_earnings',

            // Patient permissions
            'view_patient_dashboard',
            'create_booking',
            'manage_own_addresses',
            'manage_own_payment_methods',

            // Shared permissions (used by both provider and patient)
            'manage_own_profile',
            'manage_own_bookings',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions

        // Super Admin role (has all permissions)
        $superAdminRole = Role::create(['name' => 'super_admin']);
        $superAdminRole->givePermissionTo([
            'view_admin_dashboard',
            'manage_users',
            'manage_providers',
            'approve_providers',
            'manage_bookings',
            'manage_services',
            'manage_payments',
            'process_refunds',
            'manage_settlements',
            'moderate_chat',
            'moderate_reviews',
            'manage_settings',
            'view_audit_logs',
        ]);

        // Provider role
        $providerRole = Role::create(['name' => 'provider']);
        $providerRole->givePermissionTo([
            'view_provider_dashboard',
            'manage_own_profile',
            'manage_own_services',
            'manage_own_availability',
            'manage_own_bookings',
            'view_own_earnings',
        ]);

        // Patient role
        $patientRole = Role::create(['name' => 'patient']);
        $patientRole->givePermissionTo([
            'view_patient_dashboard',
            'create_booking',
            'manage_own_bookings',
            'manage_own_profile',
            'manage_own_addresses',
            'manage_own_payment_methods',
        ]);
    }
}
