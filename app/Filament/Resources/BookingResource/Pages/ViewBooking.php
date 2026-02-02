<?php

namespace App\Filament\Resources\BookingResource\Pages;

use App\Filament\Resources\BookingResource;
use App\Models\Booking;
use App\Models\BookingStatus;
use App\Models\Provider;
use Filament\Actions;
use Filament\Forms;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;
use Illuminate\Database\Eloquent\Builder;

class ViewBooking extends ViewRecord
{
    protected static string $resource = BookingResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('reassign_provider')
                ->label('Reassign Provider')
                ->icon('heroicon-o-arrow-path')
                ->color('warning')
                ->visible(fn (Booking $record): bool => ! $record->isCancelled())
                ->requiresConfirmation()
                ->modalDescription('Assign this booking to a different provider.')
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
                        ->title('Provider Reassigned Successfully')
                        ->body("Booking reassigned from {$oldProvider} to {$newProvider}")
                        ->success()
                        ->send();
                }),

            Actions\Action::make('cancel_booking')
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
                    $cancelledStatus = BookingStatus::where('name', 'Cancelled')->first();

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

            Actions\EditAction::make(),
            Actions\DeleteAction::make(),
        ];
    }

    public function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Infolists\Components\Section::make('Booking Details')
                    ->schema([
                        Infolists\Components\TextEntry::make('confirmation_number')
                            ->label('Confirmation Number')
                            ->copyable()
                            ->icon('heroicon-o-clipboard')
                            ->badge()
                            ->color('primary'),
                        Infolists\Components\TextEntry::make('status.name')
                            ->label('Status')
                            ->badge()
                            ->color(fn (string $state): string => match ($state) {
                                'Confirmed' => 'success',
                                'Completed' => 'info',
                                'Cancelled' => 'danger',
                                'Pending' => 'warning',
                                default => 'gray',
                            }),
                        Infolists\Components\TextEntry::make('collectionType.name')
                            ->label('Collection Type')
                            ->badge(),
                        Infolists\Components\TextEntry::make('scheduled_date')
                            ->label('Scheduled Date')
                            ->date(),
                        Infolists\Components\TextEntry::make('time_slot')
                            ->label('Time Slot'),
                        Infolists\Components\TextEntry::make('created_at')
                            ->label('Booking Created')
                            ->dateTime(),
                    ])
                    ->columns(3),

                Infolists\Components\Section::make('Patient Information')
                    ->schema([
                        Infolists\Components\TextEntry::make('user.full_name')
                            ->label('Full Name'),
                        Infolists\Components\TextEntry::make('user.email')
                            ->label('Email')
                            ->copyable()
                            ->icon('heroicon-o-envelope'),
                        Infolists\Components\TextEntry::make('user.phone')
                            ->label('Phone')
                            ->copyable()
                            ->icon('heroicon-o-phone'),
                        Infolists\Components\TextEntry::make('nhs_number')
                            ->label('NHS Number')
                            ->placeholder('Not provided'),
                        Infolists\Components\TextEntry::make('guardian_name')
                            ->label('Guardian Name')
                            ->placeholder('Not applicable'),
                        Infolists\Components\IconEntry::make('guardian_confirmed')
                            ->label('Guardian Confirmed')
                            ->boolean(),
                    ])
                    ->columns(3),

                Infolists\Components\Section::make('Provider Information')
                    ->schema([
                        Infolists\Components\TextEntry::make('provider.provider_name')
                            ->label('Provider Name')
                            ->placeholder('Unassigned'),
                        Infolists\Components\TextEntry::make('provider.user.email')
                            ->label('Provider Email')
                            ->copyable()
                            ->placeholder('N/A'),
                        Infolists\Components\TextEntry::make('provider.user.phone')
                            ->label('Provider Phone')
                            ->copyable()
                            ->placeholder('N/A'),
                        Infolists\Components\TextEntry::make('provider.type.name')
                            ->label('Provider Type')
                            ->badge()
                            ->placeholder('N/A'),
                        Infolists\Components\TextEntry::make('provider.status.name')
                            ->label('Provider Status')
                            ->badge()
                            ->placeholder('N/A'),
                    ])
                    ->columns(3),

                Infolists\Components\Section::make('Service Address')
                    ->schema([
                        Infolists\Components\TextEntry::make('service_address_line1')
                            ->label('Address Line 1')
                            ->placeholder('Not provided'),
                        Infolists\Components\TextEntry::make('service_address_line2')
                            ->label('Address Line 2')
                            ->placeholder('Not provided'),
                        Infolists\Components\TextEntry::make('service_town_city')
                            ->label('Town/City')
                            ->placeholder('Not provided'),
                        Infolists\Components\TextEntry::make('service_postcode')
                            ->label('Postcode')
                            ->placeholder('Not provided'),
                    ])
                    ->columns(2),

                Infolists\Components\Section::make('Booked Services')
                    ->schema([
                        Infolists\Components\RepeatableEntry::make('items')
                            ->label('')
                            ->schema([
                                Infolists\Components\TextEntry::make('providerService.service.service_name')
                                    ->label('Service Name'),
                                Infolists\Components\TextEntry::make('providerService.service.service_code')
                                    ->label('Service Code')
                                    ->badge(),
                                Infolists\Components\TextEntry::make('item_cost')
                                    ->label('Cost')
                                    ->money('GBP'),
                                Infolists\Components\TextEntry::make('agreed_comm_percent')
                                    ->label('Commission')
                                    ->suffix('%'),
                            ])
                            ->columns(4),
                    ])
                    ->collapsible(),

                Infolists\Components\Section::make('Payment Information')
                    ->schema([
                        Infolists\Components\TextEntry::make('grand_total_cost')
                            ->label('Grand Total')
                            ->money('GBP')
                            ->size(Infolists\Components\TextEntry\TextEntrySize::Large)
                            ->weight('bold'),
                        Infolists\Components\TextEntry::make('discount_amount')
                            ->label('Discount Amount')
                            ->money('GBP'),
                        Infolists\Components\TextEntry::make('promoCode.code')
                            ->label('Promo Code Used')
                            ->badge()
                            ->placeholder('None'),
                        Infolists\Components\TextEntry::make('stripe_payment_intent_id')
                            ->label('Stripe Payment Intent')
                            ->copyable()
                            ->placeholder('Not available'),
                        Infolists\Components\TextEntry::make('payment.payment_status.name')
                            ->label('Payment Status')
                            ->badge()
                            ->color(fn (?string $state): string => match ($state) {
                                'Completed' => 'success',
                                'Pending' => 'warning',
                                'Failed' => 'danger',
                                'Refunded' => 'info',
                                default => 'gray',
                            })
                            ->placeholder('No payment record'),
                        Infolists\Components\TextEntry::make('payment.payment_method.name')
                            ->label('Payment Method')
                            ->badge()
                            ->placeholder('Not available'),
                    ])
                    ->columns(3),

                Infolists\Components\Section::make('Additional Information')
                    ->schema([
                        Infolists\Components\TextEntry::make('visit_instructions')
                            ->label('Visit Instructions')
                            ->columnSpanFull()
                            ->placeholder('No special instructions'),
                        Infolists\Components\TextEntry::make('patient_notes')
                            ->label('Patient Notes')
                            ->columnSpanFull()
                            ->placeholder('No patient notes'),
                    ])
                    ->collapsible(),

                Infolists\Components\Section::make('Cancellation Information')
                    ->schema([
                        Infolists\Components\TextEntry::make('cancelled_at')
                            ->label('Cancelled At')
                            ->dateTime(),
                        Infolists\Components\TextEntry::make('cancellation_reason')
                            ->label('Cancellation Reason')
                            ->columnSpanFull(),
                    ])
                    ->visible(fn (Booking $record): bool => $record->cancelled_at !== null)
                    ->collapsible(),

                Infolists\Components\Section::make('Timeline')
                    ->schema([
                        Infolists\Components\TextEntry::make('created_at')
                            ->label('Booking Created')
                            ->dateTime(),
                        Infolists\Components\TextEntry::make('updated_at')
                            ->label('Last Updated')
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
