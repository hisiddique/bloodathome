<?php

namespace App\Filament\Pages;

use App\Models\SystemSetting;
use Filament\Forms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Support\Exceptions\Halt;

class ManageSettings extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';

    protected static ?string $navigationLabel = 'App Settings';

    protected static ?string $title = 'Application Settings';

    protected static ?string $navigationGroup = 'System';

    protected static ?int $navigationSort = 9;

    protected static string $view = 'filament.pages.manage-settings';

    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill([
            'app_name' => SystemSetting::getValue('branding.app_name', config('app.name')),
            'logo' => SystemSetting::getValue('branding.logo'),
            'favicon' => SystemSetting::getValue('branding.favicon'),
            'map_provider' => SystemSetting::getValue('api.map_provider', 'google'),
            'google_maps_key' => SystemSetting::getValue('api.google_maps_key'),
            'mapbox_token' => SystemSetting::getValue('api.mapbox_token'),
            'stripe_public_key' => SystemSetting::getValue('api.stripe_public_key'),
            'stripe_secret_key' => SystemSetting::getValue('api.stripe_secret_key'),
            'commission_percentage' => SystemSetting::getValue('platform.commission_percentage', 15),
            'cancellation_fee_percentage' => SystemSetting::getValue('platform.cancellation_fee_percentage', 10),
            'service_fee_percentage' => SystemSetting::getValue('platform.service_fee_percentage', 5),
            'vat_percentage' => SystemSetting::getValue('platform.vat_percentage', 20),
            'provider_search_radius_km' => SystemSetting::getValue('platform.provider_search_radius_km', 10),
            'date_format' => SystemSetting::getValue('platform.date_format', 'DD/MM/YYYY'),
            'admin_email' => SystemSetting::getValue('notifications.admin_email'),
        ]);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Tabs::make('Settings')
                    ->tabs([
                        Forms\Components\Tabs\Tab::make('Branding')
                            ->icon('heroicon-o-sparkles')
                            ->schema([
                                Forms\Components\TextInput::make('app_name')
                                    ->label('Application Name')
                                    ->required()
                                    ->maxLength(255),
                                Forms\Components\FileUpload::make('logo')
                                    ->label('Logo')
                                    ->image()
                                    ->directory('branding')
                                    ->helperText('Upload your application logo'),
                                Forms\Components\FileUpload::make('favicon')
                                    ->label('Favicon')
                                    ->image()
                                    ->directory('branding')
                                    ->helperText('Upload your application favicon'),
                            ]),
                        Forms\Components\Tabs\Tab::make('API Keys')
                            ->icon('heroicon-o-key')
                            ->schema([
                                Forms\Components\Select::make('map_provider')
                                    ->label('Map Provider')
                                    ->options([
                                        'google' => 'Google Maps',
                                        'mapbox' => 'Mapbox',
                                    ])
                                    ->default('google')
                                    ->live()
                                    ->helperText('Select which map provider to use for location services'),
                                Forms\Components\TextInput::make('google_maps_key')
                                    ->label('Google Maps API Key')
                                    ->password()
                                    ->revealable()
                                    ->maxLength(255)
                                    ->visible(fn (Get $get) => $get('map_provider') === 'google'),
                                Forms\Components\TextInput::make('mapbox_token')
                                    ->label('Mapbox Access Token')
                                    ->password()
                                    ->revealable()
                                    ->maxLength(255)
                                    ->visible(fn (Get $get) => $get('map_provider') === 'mapbox'),
                                Forms\Components\TextInput::make('stripe_public_key')
                                    ->label('Stripe Public Key')
                                    ->password()
                                    ->revealable()
                                    ->maxLength(255),
                                Forms\Components\TextInput::make('stripe_secret_key')
                                    ->label('Stripe Secret Key')
                                    ->password()
                                    ->revealable()
                                    ->maxLength(255),
                            ]),
                        Forms\Components\Tabs\Tab::make('Platform')
                            ->icon('heroicon-o-adjustments-horizontal')
                            ->schema([
                                Forms\Components\TextInput::make('commission_percentage')
                                    ->label('Commission Percentage')
                                    ->numeric()
                                    ->suffix('%')
                                    ->minValue(0)
                                    ->maxValue(100)
                                    ->default(15)
                                    ->helperText('Platform commission percentage on bookings'),
                                Forms\Components\TextInput::make('cancellation_fee_percentage')
                                    ->label('Cancellation Fee Percentage')
                                    ->numeric()
                                    ->suffix('%')
                                    ->minValue(0)
                                    ->maxValue(100)
                                    ->default(10)
                                    ->helperText('Fee percentage for cancelled bookings'),
                                Forms\Components\TextInput::make('service_fee_percentage')
                                    ->label('Service Fee Percentage')
                                    ->numeric()
                                    ->suffix('%')
                                    ->minValue(0)
                                    ->maxValue(100)
                                    ->default(5)
                                    ->helperText('Service fee percentage charged on bookings'),
                                Forms\Components\TextInput::make('vat_percentage')
                                    ->label('VAT Percentage')
                                    ->numeric()
                                    ->suffix('%')
                                    ->minValue(0)
                                    ->maxValue(100)
                                    ->default(20)
                                    ->helperText('VAT percentage for UK'),
                                Forms\Components\TextInput::make('provider_search_radius_km')
                                    ->label('Provider Search Radius (km)')
                                    ->numeric()
                                    ->minValue(1)
                                    ->maxValue(100)
                                    ->default(10)
                                    ->helperText('Default search radius for finding nearby providers'),
                                Forms\Components\Select::make('date_format')
                                    ->label('Date Format')
                                    ->options([
                                        'DD/MM/YYYY' => 'DD/MM/YYYY (e.g., 31/12/2026)',
                                        'MM/DD/YYYY' => 'MM/DD/YYYY (e.g., 12/31/2026)',
                                        'YYYY-MM-DD' => 'YYYY-MM-DD (e.g., 2026-12-31)',
                                    ])
                                    ->default('DD/MM/YYYY')
                                    ->required()
                                    ->helperText('Default date format used throughout the application'),
                            ]),
                        Forms\Components\Tabs\Tab::make('Notifications')
                            ->icon('heroicon-o-bell')
                            ->schema([
                                Forms\Components\TextInput::make('admin_email')
                                    ->label('Admin Email')
                                    ->email()
                                    ->maxLength(255)
                                    ->helperText('Email address for admin notifications'),
                            ]),
                    ])
                    ->columnSpanFull(),
            ])
            ->statePath('data');
    }

    public function save(): void
    {
        try {
            $data = $this->form->getState();

            SystemSetting::setValue('branding.app_name', $data['app_name'], 'string', 'branding');
            SystemSetting::setValue('branding.logo', $data['logo'], 'string', 'branding');
            SystemSetting::setValue('branding.favicon', $data['favicon'], 'string', 'branding');
            SystemSetting::setValue('api.map_provider', $data['map_provider'], 'string', 'api');
            SystemSetting::setValue('api.google_maps_key', $data['google_maps_key'] ?? null, 'string', 'api');
            SystemSetting::setValue('api.mapbox_token', $data['mapbox_token'] ?? null, 'string', 'api');
            SystemSetting::setValue('api.stripe_public_key', $data['stripe_public_key'], 'string', 'api');
            SystemSetting::setValue('api.stripe_secret_key', $data['stripe_secret_key'], 'string', 'api');
            SystemSetting::setValue('platform.commission_percentage', $data['commission_percentage'], 'float', 'platform');
            SystemSetting::setValue('platform.cancellation_fee_percentage', $data['cancellation_fee_percentage'], 'float', 'platform');
            SystemSetting::setValue('platform.service_fee_percentage', $data['service_fee_percentage'], 'float', 'platform');
            SystemSetting::setValue('platform.vat_percentage', $data['vat_percentage'], 'float', 'platform');
            SystemSetting::setValue('platform.provider_search_radius_km', $data['provider_search_radius_km'], 'integer', 'platform');
            SystemSetting::setValue('platform.date_format', $data['date_format'], 'string', 'platform');
            SystemSetting::setValue('notifications.admin_email', $data['admin_email'], 'string', 'notifications');

            Notification::make()
                ->success()
                ->title('Settings saved')
                ->body('Your settings have been saved successfully.')
                ->send();
        } catch (Halt $exception) {
            return;
        }
    }

    protected function getFormActions(): array
    {
        return [
            Forms\Components\Actions\Action::make('save')
                ->label('Save Settings')
                ->submit('save'),
        ];
    }
}
