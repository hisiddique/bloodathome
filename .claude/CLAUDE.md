# BloodAtHome - Laravel 12 Phlebotomist Booking System

## Project Overview
A Laravel 12 application for booking phlebotomist services for at-home or clinic blood tests.

## Tech Stack
- Laravel 12
- Inertia.js (React)
- PHP 8.2+
- Laravel Fortify (authentication for patients/providers)
- FilamentPHP v3 (admin panel)
- Spatie Laravel Permission (roles & permissions)

## Authentication & Guards

### Two-Guard System
The application uses **two separate authentication guards** to allow simultaneous admin and user sessions:

| Guard | Path | Users | Login URL |
|-------|------|-------|-----------|
| `web` (default) | `/patient/*`, `/provider/*` | Patients, Providers | `/login` |
| `admin` | `/sadmin/*` | Super Admin, Admin roles | `/sadmin/login` |

### Important: Role Queries in Filament/Admin Context
When querying roles inside Filament (admin panel), you **MUST specify the guard** because the admin context uses the `admin` guard, but roles are registered under the `web` guard.

```php
// WRONG - Will fail in Filament context
User::role('patient')->count();

// CORRECT - Explicitly specify web guard
User::role('patient', 'web')->count();
User::role('provider', 'web')->count();
```

### Roles (all registered under `web` guard)
- `super_admin` - Full system access
- `provider` - Phlebotomist/Lab/Clinic access
- `patient` - Customer access

### User Model Helper Methods
- `$user->isAdmin()` - Check if user has any admin role
- `$user->isProvider()` - Check if user has provider role
- `$user->isPatient()` - Check if user has patient role

## Database Schema

### Core Tables
1. **users** - Base authentication (ULID primary key)
2. **providers** - Provider profiles (phlebotomists, labs, clinics)
3. **patients** - Patient medical profiles
4. **bookings** - Appointment bookings
5. **services** - Blood test catalog
6. **chat_conversations** / **chat_messages** - Messaging system

### Computed Columns
- `User::$full_name` - Accessor computed from `first_name`, `middle_name`, `last_name`
  - Do NOT search/sort on `full_name` in database queries
  - Use `searchable(['first_name', 'last_name'])` instead

## Current Status
- Admin panel (FilamentPHP) at `/sadmin`
- Provider panel (React/Inertia) at `/provider`
- Patient panel (React/Inertia) at `/patient`
- Booking flow at `/booking`

## Test Users
| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@bloodathome.com | password |
| Provider (Active) | provider@bloodathome.com | password |
| Provider (Pending) | pending-provider@bloodathome.com | password |
| Patient | patient@bloodathome.com | password |
| Patient | emily@bloodathome.com | password |

## Session Log
- 2025-12-24: Created project memory file, starting database schema and API implementation
- 2026-02-02: Implemented two-guard authentication system (web + admin), FilamentPHP admin panel
