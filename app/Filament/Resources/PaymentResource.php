<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PaymentResource\Pages;
use App\Models\Payment;
use App\Models\PaymentStatus;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class PaymentResource extends Resource
{
    protected static ?string $model = Payment::class;

    protected static ?string $navigationIcon = 'heroicon-o-credit-card';

    protected static ?string $navigationGroup = 'Financial';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Payment Information')
                    ->schema([
                        Forms\Components\Select::make('booking_id')
                            ->relationship('booking', 'confirmation_number')
                            ->searchable()
                            ->required()
                            ->disabled(),
                        Forms\Components\Select::make('method_id')
                            ->relationship('method', 'name')
                            ->required()
                            ->disabled(),
                        Forms\Components\TextInput::make('amount')
                            ->required()
                            ->numeric()
                            ->prefix('£')
                            ->disabled(),
                        Forms\Components\Select::make('payment_status_id')
                            ->relationship('status', 'name')
                            ->required()
                            ->disabled(),
                        Forms\Components\DateTimePicker::make('payment_date')
                            ->disabled(),
                    ])->columns(2),
                Forms\Components\Section::make('Transaction Details')
                    ->schema([
                        Forms\Components\TextInput::make('transaction_ref')
                            ->label('Transaction Reference')
                            ->maxLength(100)
                            ->disabled(),
                        Forms\Components\TextInput::make('stripe_payment_intent_id')
                            ->label('Stripe Payment Intent')
                            ->maxLength(255)
                            ->disabled(),
                        Forms\Components\TextInput::make('stripe_charge_id')
                            ->label('Stripe Charge ID')
                            ->maxLength(255)
                            ->disabled(),
                        Forms\Components\TextInput::make('card_last_four')
                            ->label('Card Last 4 Digits')
                            ->maxLength(4)
                            ->disabled(),
                        Forms\Components\TextInput::make('card_brand')
                            ->label('Card Brand')
                            ->maxLength(50)
                            ->disabled(),
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
                Tables\Columns\TextColumn::make('booking.user.name')
                    ->label('Patient')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('amount')
                    ->money('GBP')
                    ->sortable(),
                Tables\Columns\TextColumn::make('method.name')
                    ->label('Payment Method')
                    ->sortable()
                    ->badge(),
                Tables\Columns\TextColumn::make('status.name')
                    ->label('Status')
                    ->sortable()
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'Completed' => 'success',
                        'Pending' => 'warning',
                        'Failed' => 'danger',
                        'Refunded' => 'gray',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('payment_status_id')
                    ->label('Payment Status')
                    ->relationship('status', 'name')
                    ->multiple()
                    ->preload(),
                Tables\Filters\SelectFilter::make('method_id')
                    ->label('Payment Method')
                    ->relationship('method', 'name')
                    ->multiple()
                    ->preload(),
                Tables\Filters\Filter::make('created_at')
                    ->form([
                        Forms\Components\DatePicker::make('created_from')
                            ->label('Created From'),
                        Forms\Components\DatePicker::make('created_until')
                            ->label('Created Until'),
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
                Tables\Actions\Action::make('refund')
                    ->label('Process Refund')
                    ->icon('heroicon-o-arrow-path')
                    ->color('warning')
                    ->requiresConfirmation()
                    ->visible(fn (Payment $record): bool => $record->status->name === 'Completed')
                    ->action(function (Payment $record): void {
                        $refundedStatus = PaymentStatus::where('name', 'Refunded')->first();

                        $record->update([
                            'payment_status_id' => $refundedStatus->id,
                        ]);

                        Notification::make()
                            ->title('Refund Processed')
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
            'index' => Pages\ListPayments::route('/'),
            'view' => Pages\ViewPayment::route('/{record}'),
        ];
    }
}
