<?php

namespace App\Filament\Widgets;

use App\Models\Booking;
use Filament\Tables;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class LatestBookingsWidget extends BaseWidget
{
    protected static ?int $sort = 3;

    protected int|string|array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Booking::query()
                    ->with(['user', 'provider.user', 'status', 'items.providerService.service'])
                    ->latest()
                    ->limit(5)
            )
            ->columns([
                TextColumn::make('confirmation_number')
                    ->label('Booking #')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),

                TextColumn::make('user.full_name')
                    ->label('Patient')
                    ->searchable(['user.first_name', 'user.last_name'])
                    ->sortable(false),

                TextColumn::make('provider.user.full_name')
                    ->label('Provider')
                    ->searchable(['provider.user.first_name', 'provider.user.last_name'])
                    ->sortable(false),

                TextColumn::make('items.providerService.service.name')
                    ->label('Service')
                    ->listWithLineBreaks()
                    ->limitList(2)
                    ->expandableLimitedList(),

                TextColumn::make('status.name')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'Pending' => 'warning',
                        'Confirmed' => 'info',
                        'Completed' => 'success',
                        'Cancelled' => 'danger',
                        default => 'gray',
                    }),

                TextColumn::make('scheduled_date')
                    ->label('Scheduled Date')
                    ->date('d M Y')
                    ->sortable(),

                TextColumn::make('grand_total_cost')
                    ->label('Total')
                    ->money('GBP')
                    ->sortable(),
            ])
            ->actions([
                Tables\Actions\Action::make('view')
                    ->label('View')
                    ->icon('heroicon-m-eye')
                    ->url(function (Booking $record): ?string {
                        try {
                            return route('filament.admin.resources.bookings.view', ['record' => $record]);
                        } catch (\Exception $e) {
                            return null;
                        }
                    })
                    ->visible(fn (): bool => \Illuminate\Support\Facades\Route::has('filament.admin.resources.bookings.view')),
            ])
            ->heading('Latest Bookings')
            ->description('The 5 most recent bookings');
    }
}
