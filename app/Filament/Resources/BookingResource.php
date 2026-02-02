<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BookingResource\Pages;
use App\Models\Booking;
use App\Models\BookingStatus;
use App\Models\Provider;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class BookingResource extends Resource
{
    protected static ?string $model = Booking::class;

    protected static ?string $navigationIcon = 'heroicon-o-calendar-days';

    protected static ?string $navigationLabel = 'Bookings';

    protected static ?string $modelLabel = 'Booking';

    protected static ?string $pluralModelLabel = 'Bookings';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Booking Information')
                    ->schema([
                        Forms\Components\TextInput::make('confirmation_number')
                            ->label('Confirmation Number')
                            ->disabled()
                            ->default(fn () => Booking::generateConfirmationNumber()),
                        Forms\Components\Select::make('status_id')
                            ->label('Status')
                            ->relationship('status', 'name')
                            ->required()
                            ->preload(),
                        Forms\Components\Select::make('collection_type_id')
                            ->label('Collection Type')
                            ->relationship('collectionType', 'name')
                            ->required()
                            ->preload(),
                    ])
                    ->columns(3),

                Forms\Components\Section::make('Patient Information')
                    ->schema([
                        Forms\Components\Select::make('user_id')
                            ->label('Patient')
                            ->relationship('user', 'email')
                            ->getOptionLabelFromRecordUsing(fn ($record) => $record->full_name)
                            ->searchable(['first_name', 'last_name', 'email'])
                            ->preload()
                            ->required(),
                        Forms\Components\TextInput::make('nhs_number')
                            ->label('NHS Number')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('guardian_name')
                            ->label('Guardian Name')
                            ->maxLength(255),
                        Forms\Components\Checkbox::make('guardian_confirmed')
                            ->label('Guardian Confirmed'),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Provider Assignment')
                    ->schema([
                        Forms\Components\Select::make('provider_id')
                            ->label('Provider')
                            ->relationship('provider', 'provider_name')
                            ->searchable()
                            ->preload()
                            ->required(),
                    ]),

                Forms\Components\Section::make('Schedule')
                    ->schema([
                        Forms\Components\DatePicker::make('scheduled_date')
                            ->label('Scheduled Date')
                            ->required()
                            ->native(false),
                        Forms\Components\TextInput::make('time_slot')
                            ->label('Time Slot')
                            ->required()
                            ->maxLength(255),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Service Address')
                    ->schema([
                        Forms\Components\TextInput::make('service_address_line1')
                            ->label('Address Line 1')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('service_address_line2')
                            ->label('Address Line 2')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('service_town_city')
                            ->label('Town/City')
                            ->maxLength(100),
                        Forms\Components\TextInput::make('service_postcode')
                            ->label('Postcode')
                            ->maxLength(10),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Payment')
                    ->schema([
                        Forms\Components\TextInput::make('grand_total_cost')
                            ->label('Grand Total')
                            ->numeric()
                            ->prefix('£')
                            ->required(),
                        Forms\Components\TextInput::make('discount_amount')
                            ->label('Discount Amount')
                            ->numeric()
                            ->prefix('£')
                            ->default(0.00),
                        Forms\Components\Select::make('promo_code_id')
                            ->label('Promo Code')
                            ->relationship('promoCode', 'code')
                            ->searchable()
                            ->preload(),
                        Forms\Components\TextInput::make('stripe_payment_intent_id')
                            ->label('Stripe Payment Intent ID')
                            ->maxLength(255)
                            ->disabled(),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Additional Information')
                    ->schema([
                        Forms\Components\Textarea::make('visit_instructions')
                            ->label('Visit Instructions')
                            ->rows(3)
                            ->columnSpanFull(),
                        Forms\Components\Textarea::make('patient_notes')
                            ->label('Patient Notes')
                            ->rows(3)
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('Cancellation Information')
                    ->schema([
                        Forms\Components\DateTimePicker::make('cancelled_at')
                            ->label('Cancelled At')
                            ->disabled(),
                        Forms\Components\Textarea::make('cancellation_reason')
                            ->label('Cancellation Reason')
                            ->rows(3)
                            ->columnSpanFull()
                            ->disabled(),
                    ])
                    ->visible(fn ($record): bool => $record?->cancelled_at !== null)
                    ->collapsed(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query) => $query->with(['items.providerService.service']))
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->label('ID')
                    ->searchable()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('confirmation_number')
                    ->label('Confirmation #')
                    ->searchable()
                    ->sortable()
                    ->copyable(),
                Tables\Columns\TextColumn::make('user.full_name')
                    ->label('Patient')
                    ->searchable(['user.first_name', 'user.last_name', 'user.email'])
                    ->sortable(false),
                Tables\Columns\TextColumn::make('provider.provider_name')
                    ->label('Provider')
                    ->searchable()
                    ->sortable()
                    ->default('Unassigned')
                    ->placeholder('Unassigned'),
                Tables\Columns\TextColumn::make('items_summary')
                    ->label('Services')
                    ->getStateUsing(function (Booking $record): string {
                        $items = $record->items;

                        if ($items->isEmpty()) {
                            return 'No services';
                        }

                        $serviceNames = $items->map(function ($item) {
                            return $item->providerService?->service?->service_name ?? 'Unknown';
                        })->take(2)->join(', ');

                        $count = $items->count();
                        if ($count > 2) {
                            $serviceNames .= ' +'.($count - 2).' more';
                        }

                        return $serviceNames;
                    })
                    ->searchable(false)
                    ->sortable(false),
                Tables\Columns\TextColumn::make('status.name')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'Confirmed' => 'success',
                        'Completed' => 'info',
                        'Cancelled' => 'danger',
                        'Pending' => 'warning',
                        default => 'gray',
                    })
                    ->sortable(),
                Tables\Columns\TextColumn::make('scheduled_date')
                    ->label('Scheduled Date')
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('time_slot')
                    ->label('Time')
                    ->sortable()
                    ->toggleable(),
                Tables\Columns\TextColumn::make('grand_total_cost')
                    ->label('Total')
                    ->money('GBP')
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Created')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->relationship('status', 'name')
                    ->multiple()
                    ->preload(),
                Tables\Filters\SelectFilter::make('provider')
                    ->relationship('provider', 'provider_name')
                    ->searchable()
                    ->preload(),
                Tables\Filters\SelectFilter::make('patient')
                    ->label('Patient')
                    ->relationship('user', 'email')
                    ->getOptionLabelFromRecordUsing(fn ($record) => $record->full_name)
                    ->searchable()
                    ->preload(),
                Filter::make('scheduled_date')
                    ->form([
                        Forms\Components\DatePicker::make('scheduled_from')
                            ->label('Scheduled From')
                            ->native(false),
                        Forms\Components\DatePicker::make('scheduled_until')
                            ->label('Scheduled Until')
                            ->native(false),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['scheduled_from'],
                                fn (Builder $query, $date): Builder => $query->whereDate('scheduled_date', '>=', $date),
                            )
                            ->when(
                                $data['scheduled_until'],
                                fn (Builder $query, $date): Builder => $query->whereDate('scheduled_date', '<=', $date),
                            );
                    }),
                Tables\Filters\TrashedFilter::make(),
            ])
            ->actions([
                Tables\Actions\ActionGroup::make([
                    Tables\Actions\ViewAction::make(),
                    Tables\Actions\EditAction::make(),
                    Tables\Actions\Action::make('reassign_provider')
                        ->label('Reassign Provider')
                        ->icon('heroicon-o-arrow-path')
                        ->color('warning')
                        ->visible(fn (Booking $record): bool => ! $record->isCancelled())
                        ->requiresConfirmation()
                        ->form([
                            Forms\Components\Select::make('provider_id')
                                ->label('New Provider')
                                ->options(Provider::query()
                                    ->whereHas('status', fn (Builder $query) => $query->where('name', 'Active'))
                                    ->pluck('provider_name', 'id')
                                )
                                ->searchable()
                                ->required(),
                            Forms\Components\Textarea::make('reason')
                                ->label('Reason for Reassignment')
                                ->rows(3)
                                ->required(),
                        ])
                        ->action(function (Booking $record, array $data): void {
                            $oldProvider = $record->provider?->provider_name ?? 'Unassigned';

                            $record->update([
                                'provider_id' => $data['provider_id'],
                            ]);

                            $newProvider = $record->fresh()->provider->provider_name;

                            Notification::make()
                                ->title('Provider Reassigned')
                                ->body("Booking reassigned from {$oldProvider} to {$newProvider}")
                                ->success()
                                ->send();
                        }),
                    Tables\Actions\Action::make('cancel_with_refund')
                        ->label('Cancel Booking')
                        ->icon('heroicon-o-x-circle')
                        ->color('danger')
                        ->visible(fn (Booking $record): bool => ! $record->isCancelled())
                        ->requiresConfirmation()
                        ->modalDescription('Are you sure you want to cancel this booking? You can optionally process a refund.')
                        ->form([
                            Forms\Components\Textarea::make('cancellation_reason')
                                ->label('Cancellation Reason')
                                ->required()
                                ->rows(3),
                            Forms\Components\Checkbox::make('process_refund')
                                ->label('Process Refund')
                                ->default(true)
                                ->helperText('If checked, a refund will be initiated via Stripe.'),
                        ])
                        ->action(function (Booking $record, array $data): void {
                            $cancelledStatus = BookingStatus::cancelled();

                            $record->update([
                                'status_id' => $cancelledStatus?->id ?? $record->status_id,
                                'cancelled_at' => now(),
                                'cancellation_reason' => $data['cancellation_reason'],
                            ]);

                            $message = 'Booking cancelled successfully.';

                            if ($data['process_refund']) {
                                $message .= ' Refund will be processed.';
                            }

                            Notification::make()
                                ->title('Booking Cancelled')
                                ->body($message)
                                ->warning()
                                ->send();
                        }),
                    Tables\Actions\DeleteAction::make(),
                ]),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\ForceDeleteBulkAction::make(),
                    Tables\Actions\RestoreBulkAction::make(),
                ]),
            ])
            ->defaultSort('scheduled_date', 'desc');
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
            'index' => Pages\ListBookings::route('/'),
            'view' => Pages\ViewBooking::route('/{record}'),
            'edit' => Pages\EditBooking::route('/{record}/edit'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->withoutGlobalScopes([
                SoftDeletingScope::class,
            ]);
    }
}
