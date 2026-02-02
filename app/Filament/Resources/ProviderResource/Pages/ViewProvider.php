<?php

namespace App\Filament\Resources\ProviderResource\Pages;

use App\Filament\Resources\ProviderResource;
use App\Models\Provider;
use App\Models\ProviderStatus;
use Filament\Actions;
use Filament\Forms;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;
use Illuminate\Support\Facades\Auth;

class ViewProvider extends ViewRecord
{
    protected static string $resource = ProviderResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('approve')
                ->label('Approve Provider')
                ->icon('heroicon-o-check-circle')
                ->color('success')
                ->visible(fn (Provider $record): bool => $record->approved_at === null)
                ->requiresConfirmation()
                ->modalDescription('Are you sure you want to approve this provider? They will be able to accept bookings.')
                ->form([
                    Forms\Components\Textarea::make('provider_notes')
                        ->label('Approval Notes')
                        ->rows(3),
                ])
                ->action(function (Provider $record, array $data): void {
                    $activeStatus = ProviderStatus::where('name', 'Active')->first();

                    $record->update([
                        'approved_at' => now(),
                        'approved_by' => Auth::id(),
                        'status_id' => $activeStatus?->id ?? $record->status_id,
                        'provider_notes' => $data['provider_notes'] ?? $record->provider_notes,
                        'rejection_reason' => null,
                    ]);

                    Notification::make()
                        ->title('Provider Approved Successfully')
                        ->success()
                        ->send();
                }),

            Actions\Action::make('reject')
                ->label('Reject Provider')
                ->icon('heroicon-o-x-circle')
                ->color('danger')
                ->visible(fn (Provider $record): bool => $record->approved_at === null)
                ->requiresConfirmation()
                ->modalDescription('Please provide a reason for rejecting this provider application.')
                ->form([
                    Forms\Components\Textarea::make('rejection_reason')
                        ->label('Rejection Reason')
                        ->required()
                        ->rows(3),
                ])
                ->action(function (Provider $record, array $data): void {
                    $inactiveStatus = ProviderStatus::where('name', 'InActive')->first();

                    $record->update([
                        'rejection_reason' => $data['rejection_reason'],
                        'status_id' => $inactiveStatus?->id ?? $record->status_id,
                    ]);

                    Notification::make()
                        ->title('Provider Rejected')
                        ->body('The provider has been notified of the rejection.')
                        ->warning()
                        ->send();
                }),

            Actions\EditAction::make(),
            Actions\DeleteAction::make(),
        ];
    }

    public function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Infolists\Components\Section::make('User Information')
                    ->schema([
                        Infolists\Components\TextEntry::make('user.full_name')
                            ->label('Full Name'),
                        Infolists\Components\TextEntry::make('user.email')
                            ->label('Email')
                            ->copyable(),
                        Infolists\Components\TextEntry::make('user.phone')
                            ->label('Phone')
                            ->copyable(),
                    ])
                    ->columns(3),

                Infolists\Components\Section::make('Provider Details')
                    ->schema([
                        Infolists\Components\TextEntry::make('provider_name')
                            ->label('Provider Name'),
                        Infolists\Components\TextEntry::make('type.name')
                            ->label('Provider Type')
                            ->badge(),
                        Infolists\Components\TextEntry::make('status.name')
                            ->label('Status')
                            ->badge()
                            ->color(fn (string $state): string => match ($state) {
                                'Active' => 'success',
                                'InActive' => 'danger',
                                'Pending' => 'warning',
                                default => 'gray',
                            }),
                        Infolists\Components\TextEntry::make('experience_years')
                            ->label('Years of Experience')
                            ->suffix(' years'),
                        Infolists\Components\TextEntry::make('average_rating')
                            ->label('Average Rating')
                            ->suffix('/5'),
                        Infolists\Components\TextEntry::make('total_reviews')
                            ->label('Total Reviews'),
                    ])
                    ->columns(3),

                Infolists\Components\Section::make('Address')
                    ->schema([
                        Infolists\Components\TextEntry::make('address_line1')
                            ->label('Address Line 1'),
                        Infolists\Components\TextEntry::make('address_line2')
                            ->label('Address Line 2'),
                        Infolists\Components\TextEntry::make('town_city')
                            ->label('Town/City'),
                        Infolists\Components\TextEntry::make('postcode')
                            ->label('Postcode'),
                        Infolists\Components\TextEntry::make('latitude')
                            ->label('Latitude'),
                        Infolists\Components\TextEntry::make('longitude')
                            ->label('Longitude'),
                    ])
                    ->columns(3),

                Infolists\Components\Section::make('Profile')
                    ->schema([
                        Infolists\Components\ImageEntry::make('profile_thumbnail_url')
                            ->label('Profile Image')
                            ->disk('public')
                            ->height(200),
                        Infolists\Components\TextEntry::make('bio')
                            ->label('Biography')
                            ->columnSpanFull(),
                    ])
                    ->columns(2),

                Infolists\Components\Section::make('Documents')
                    ->schema([
                        Infolists\Components\TextEntry::make('dbs_certificate_path')
                            ->label('DBS Certificate')
                            ->url(fn (?string $state): ?string => $state ? asset('storage/'.$state) : null)
                            ->openUrlInNewTab()
                            ->placeholder('Not uploaded')
                            ->icon('heroicon-o-document')
                            ->iconColor('primary'),
                        Infolists\Components\TextEntry::make('insurance_document_path')
                            ->label('Insurance Document')
                            ->url(fn (?string $state): ?string => $state ? asset('storage/'.$state) : null)
                            ->openUrlInNewTab()
                            ->placeholder('Not uploaded')
                            ->icon('heroicon-o-document')
                            ->iconColor('primary'),
                    ])
                    ->columns(2),

                Infolists\Components\Section::make('Approval Information')
                    ->schema([
                        Infolists\Components\TextEntry::make('approved_at')
                            ->label('Approved At')
                            ->dateTime()
                            ->placeholder('Not approved'),
                        Infolists\Components\TextEntry::make('approver.full_name')
                            ->label('Approved By')
                            ->placeholder('N/A'),
                        Infolists\Components\TextEntry::make('provider_notes')
                            ->label('Internal Notes')
                            ->columnSpanFull()
                            ->placeholder('No notes'),
                        Infolists\Components\TextEntry::make('rejection_reason')
                            ->label('Rejection Reason')
                            ->columnSpanFull()
                            ->placeholder('Not rejected')
                            ->color('danger'),
                    ])
                    ->columns(2),

                Infolists\Components\Section::make('Timestamps')
                    ->schema([
                        Infolists\Components\TextEntry::make('created_at')
                            ->label('Created At')
                            ->dateTime(),
                        Infolists\Components\TextEntry::make('updated_at')
                            ->label('Updated At')
                            ->dateTime(),
                        Infolists\Components\TextEntry::make('deleted_at')
                            ->label('Deleted At')
                            ->dateTime()
                            ->placeholder('Not deleted'),
                    ])
                    ->columns(3)
                    ->collapsed(),
            ]);
    }
}
