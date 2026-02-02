<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProviderSettlementResource\Pages;
use App\Models\ProviderSettlement;
use App\Models\SettlementStatus;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ProviderSettlementResource extends Resource
{
    protected static ?string $model = ProviderSettlement::class;

    protected static ?string $navigationIcon = 'heroicon-o-banknotes';

    protected static ?string $navigationLabel = 'Settlements';

    protected static ?string $modelLabel = 'Settlement';

    protected static ?string $navigationGroup = 'Financial';

    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Settlement Information')
                    ->schema([
                        Forms\Components\Select::make('booking_id')
                            ->relationship('booking', 'confirmation_number')
                            ->searchable()
                            ->required(),
                        Forms\Components\Select::make('provider_id')
                            ->relationship('provider', 'provider_name')
                            ->searchable()
                            ->required(),
                        Forms\Components\Select::make('settlement_status_id')
                            ->relationship('status', 'name')
                            ->default(fn () => SettlementStatus::where('name', 'Pending')->first()?->id)
                            ->required(),
                    ])->columns(2),
                Forms\Components\Section::make('Financial Details')
                    ->schema([
                        Forms\Components\TextInput::make('collected_amount')
                            ->label('Collected Amount')
                            ->required()
                            ->numeric()
                            ->prefix('£')
                            ->reactive()
                            ->afterStateUpdated(function ($state, callable $set, callable $get): void {
                                $percentage = $get('commission_percentage') ?? 0;
                                $commission = ($state * $percentage) / 100;
                                $set('commission_amount', number_format($commission, 2, '.', ''));
                                $set('provider_payout_amount', number_format($state - $commission, 2, '.', ''));
                            }),
                        Forms\Components\TextInput::make('commission_percentage')
                            ->label('Commission %')
                            ->required()
                            ->numeric()
                            ->suffix('%')
                            ->reactive()
                            ->afterStateUpdated(function ($state, callable $set, callable $get): void {
                                $amount = $get('collected_amount') ?? 0;
                                $commission = ($amount * $state) / 100;
                                $set('commission_amount', number_format($commission, 2, '.', ''));
                                $set('provider_payout_amount', number_format($amount - $commission, 2, '.', ''));
                            }),
                        Forms\Components\TextInput::make('commission_amount')
                            ->label('Commission Amount')
                            ->required()
                            ->numeric()
                            ->prefix('£')
                            ->disabled()
                            ->dehydrated(),
                        Forms\Components\TextInput::make('provider_payout_amount')
                            ->label('Provider Payout')
                            ->required()
                            ->numeric()
                            ->prefix('£')
                            ->disabled()
                            ->dehydrated(),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->label('ID')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('booking.confirmation_number')
                    ->label('Booking')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('provider.user.name')
                    ->label('Provider')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('provider_payout_amount')
                    ->label('Payout Amount')
                    ->money('GBP')
                    ->sortable(),
                Tables\Columns\TextColumn::make('status.name')
                    ->label('Status')
                    ->sortable()
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'Paid' => 'success',
                        'Processing' => 'info',
                        'Pending' => 'warning',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Period Start')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Period End')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('settlement_status_id')
                    ->label('Status')
                    ->relationship('status', 'name')
                    ->multiple()
                    ->preload(),
                Tables\Filters\SelectFilter::make('provider_id')
                    ->label('Provider')
                    ->relationship('provider', 'provider_name')
                    ->searchable()
                    ->preload(),
                Tables\Filters\Filter::make('created_at')
                    ->form([
                        Forms\Components\DatePicker::make('created_from')
                            ->label('From Date'),
                        Forms\Components\DatePicker::make('created_until')
                            ->label('Until Date'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['created_from'],
                                fn (Builder $query, $date): Builder => $query->whereDate('created_at', '>=', $date),
                            )
                            ->when(
                                $data['created_until'],
                                fn (Builder $query, $date): Builder => $query->whereDate('created_at', '<=', $date),
                            );
                    }),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('markAsPaid')
                    ->label('Mark as Paid')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->visible(fn (ProviderSettlement $record): bool => $record->status->name !== 'Paid')
                    ->action(function (ProviderSettlement $record): void {
                        $paidStatus = SettlementStatus::where('name', 'Paid')->first();

                        $record->update([
                            'settlement_status_id' => $paidStatus->id,
                        ]);

                        Notification::make()
                            ->title('Settlement marked as paid')
                            ->success()
                            ->send();
                    }),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    //
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProviderSettlements::route('/'),
            'create' => Pages\CreateProviderSettlement::route('/create'),
            'view' => Pages\ViewProviderSettlement::route('/{record}'),
        ];
    }
}
