<?php

namespace App\Filament\Widgets;

use App\Models\Provider;
use App\Models\ProviderStatus;
use Filament\Notifications\Notification;
use Filament\Tables;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Database\Eloquent\Builder;

class PendingApprovalsWidget extends BaseWidget
{
    protected static ?int $sort = 2;

    protected int|string|array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Provider::query()
                    ->with(['user', 'type', 'status'])
                    ->whereHas('status', function (Builder $query) {
                        $query->where('name', 'Pending');
                    })
                    ->latest()
            )
            ->columns([
                TextColumn::make('user.full_name')
                    ->label('Provider Name')
                    ->searchable(['user.first_name', 'user.last_name'])
                    ->sortable(false)
                    ->weight('bold'),

                TextColumn::make('type.name')
                    ->label('Provider Type')
                    ->badge()
                    ->color('info'),

                TextColumn::make('user.email')
                    ->label('Email')
                    ->searchable()
                    ->copyable(),

                TextColumn::make('user.phone')
                    ->label('Phone')
                    ->searchable()
                    ->copyable(),

                TextColumn::make('experience_years')
                    ->label('Experience')
                    ->suffix(' years')
                    ->sortable(),

                TextColumn::make('created_at')
                    ->label('Registration Date')
                    ->date('d M Y')
                    ->sortable(),
            ])
            ->actions([
                Tables\Actions\Action::make('approve')
                    ->label('Approve')
                    ->icon('heroicon-m-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->action(function (Provider $record) {
                        $activeStatus = ProviderStatus::where('name', 'Active')->first();

                        if ($activeStatus) {
                            $record->update(['status_id' => $activeStatus->id]);

                            Notification::make()
                                ->title('Provider Approved')
                                ->success()
                                ->body("Provider {$record->user->full_name} has been approved successfully.")
                                ->send();
                        }
                    }),

                Tables\Actions\Action::make('reject')
                    ->label('Reject')
                    ->icon('heroicon-m-x-circle')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->modalDescription('Are you sure you want to reject this provider? This action cannot be undone.')
                    ->action(function (Provider $record) {
                        $inactiveStatus = ProviderStatus::where('name', 'InActive')->first();

                        if ($inactiveStatus) {
                            $record->update(['status_id' => $inactiveStatus->id]);

                            Notification::make()
                                ->title('Provider Rejected')
                                ->warning()
                                ->body("Provider {$record->user->full_name} has been rejected.")
                                ->send();
                        }
                    }),

                Tables\Actions\Action::make('view')
                    ->label('View Details')
                    ->icon('heroicon-m-eye')
                    ->url(function (Provider $record): ?string {
                        try {
                            return route('filament.admin.resources.providers.view', ['record' => $record]);
                        } catch (\Exception $e) {
                            return null;
                        }
                    })
                    ->visible(fn (): bool => \Illuminate\Support\Facades\Route::has('filament.admin.resources.providers.view')),
            ])
            ->heading('Pending Provider Approvals')
            ->description('Providers awaiting approval')
            ->emptyStateHeading('No Pending Approvals')
            ->emptyStateDescription('All providers have been reviewed.')
            ->emptyStateIcon('heroicon-o-check-circle');
    }

    public static function canView(): bool
    {
        return Provider::whereHas('status', function (Builder $query) {
            $query->where('name', 'Pending');
        })->exists();
    }
}
