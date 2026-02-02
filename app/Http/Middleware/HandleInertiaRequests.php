<?php

namespace App\Http\Middleware;

use App\Services\SystemSettingService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user()?->load(['patient', 'provider']),
                'roles' => $request->user()?->getRoleNames(),
                'isAdmin' => $request->user()?->isAdmin(),
                'isProvider' => $request->user()?->isProvider(),
                'isPatient' => $request->user()?->isPatient(),
            ],
            'settings' => [
                'app_name' => SystemSettingService::get('branding.app_name', config('app.name')),
                'logo' => SystemSettingService::get('branding.logo'),
                'favicon' => SystemSettingService::get('branding.favicon'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'mapProvider' => \App\Models\SystemSetting::getValue('api.map_provider', 'google'),
            'googleMapsKey' => \App\Models\SystemSetting::getValue('api.google_maps_key') ?? config('services.google.maps_key'),
            'mapboxToken' => \App\Models\SystemSetting::getValue('api.mapbox_token') ?? config('services.mapbox.public_token'),
            'stripePublicKey' => \App\Models\SystemSetting::getValue('api.stripe_public_key') ?? config('services.stripe.key'),
            'serviceFeePercentage' => (float) \App\Models\SystemSetting::getValue('platform.service_fee_percentage', 5),
            'vatPercentage' => (float) \App\Models\SystemSetting::getValue('platform.vat_percentage', 20),
        ];
    }
}
