<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProviderResource\Pages;
use App\Models\Provider;
use App\Models\ProviderStatus;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Illuminate\Support\Facades\Auth;

class ProviderResource extends Resource
{
    protected static ?string $model = Provider::class;

    protected static ?string $navigationIcon = 'heroicon-o-building-office-2';

    protected static ?string $navigationLabel = 'Providers';

    protected static ?string $modelLabel = 'Provider';

    protected static ?string $pluralModelLabel = 'Providers';

    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('User Information')
                    ->schema([
                        Forms\Components\Select::make('user_id')
                            ->relationship('user', 'email')
                            ->getOptionLabelFromRecordUsing(fn ($record) => $record->full_name)
                            ->searchable(['first_name', 'last_name', 'email'])
                            ->preload()
                            ->required()
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('Provider Details')
                    ->schema([
                        Forms\Components\Select::make('type_id')
                            ->label('Provider Type')
                            ->relationship('type', 'name')
                            ->required(),
                        Forms\Components\Select::make('status_id')
                            ->label('Status')
                            ->relationship('status', 'name')
                            ->required(),
                        Forms\Components\TextInput::make('provider_name')
                            ->label('Provider Name')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('experience_years')
                            ->label('Years of Experience')
                            ->numeric()
                            ->minValue(0),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Address')
                    ->schema([
                        Forms\Components\TextInput::make('address_line1')
                            ->label('Address Line 1')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('address_line2')
                            ->label('Address Line 2')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('town_city')
                            ->label('Town/City')
                            ->required()
                            ->maxLength(100),
                        Forms\Components\TextInput::make('postcode')
                            ->label('Postcode')
                            ->required()
                            ->maxLength(10),
                        Forms\Components\TextInput::make('latitude')
                            ->numeric()
                            ->step('0.00000001'),
                        Forms\Components\TextInput::make('longitude')
                            ->numeric()
                            ->step('0.00000001'),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Profile')
                    ->schema([
                        Forms\Components\FileUpload::make('profile_thumbnail_url')
                            ->label('Profile Image')
                            ->image()
                            ->disk('public')
                            ->directory('provider-profiles'),
                        Forms\Components\Textarea::make('bio')
                            ->label('Biography')
                            ->rows(4)
                            ->columnSpanFull(),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Documents')
                    ->schema([
                        Forms\Components\FileUpload::make('dbs_certificate_path')
                            ->label('DBS Certificate')
                            ->acceptedFileTypes(['application/pdf', 'image/*'])
                            ->disk('private')
                            ->directory('provider-documents/dbs'),
                        Forms\Components\FileUpload::make('insurance_document_path')
                            ->label('Insurance Document')
                            ->acceptedFileTypes(['application/pdf', 'image/*'])
                            ->disk('private')
                            ->directory('provider-documents/insurance'),
                    ])
                    ->columns(2),

                Forms\Components\Section::make('Admin Notes')
                    ->schema([
                        Forms\Components\Textarea::make('provider_notes')
                            ->label('Internal Notes')
                            ->rows(3)
                            ->columnSpanFull(),
                        Forms\Components\Textarea::make('rejection_reason')
                            ->label('Rejection Reason')
                            ->rows(3)
                            ->columnSpanFull()
                            ->visible(fn (?Model $record): bool => $record?->rejection_reason !== null),
                    ]),

                Forms\Components\Section::make('Approval Information')
                    ->schema([
                        Forms\Components\DateTimePicker::make('approved_at')
                            ->label('Approved At')
                            ->disabled(),
                        Forms\Components\Select::make('approved_by')
                            ->label('Approved By')
                            ->relationship('approver', 'email')
                            ->getOptionLabelFromRecordUsing(fn ($record) => $record->full_name)
                            ->disabled(),
                    ])
                    ->columns(2)
                    ->visible(fn (?Model $record): bool => $record?->approved_at !== null),

                Forms\Components\Section::make('Statistics')
                    ->schema([
                        Forms\Components\TextInput::make('average_rating')
                            ->label('Average Rating')
                            ->numeric()
                            ->disabled()
                            ->default(0.00),
                        Forms\Components\TextInput::make('total_reviews')
                            ->label('Total Reviews')
                            ->numeric()
                            ->disabled()
                            ->default(0),
                    ])
                    ->columns(2)
                    ->visible(fn (string $context): bool => $context === 'edit'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->label('ID')
                    ->searchable()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('user.full_name')
                    ->label('User')
                    ->searchable(['user.first_name', 'user.last_name', 'user.email'])
                    ->sortable(false),
                Tables\Columns\TextColumn::make('provider_name')
                    ->label('Provider Name')
                    ->searchable()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('type.name')
                    ->label('Type')
                    ->badge()
                    ->sortable(),
                Tables\Columns\TextColumn::make('status.name')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'Active' => 'success',
                        'InActive' => 'danger',
                        'Pending' => 'warning',
                        default => 'gray',
                    })
                    ->sortable(),
                Tables\Columns\TextColumn::make('average_rating')
                    ->label('Rating')
                    ->numeric(decimalPlaces: 2)
                    ->sortable()
                    ->suffix('/5'),
                Tables\Columns\TextColumn::make('total_reviews')
                    ->label('Reviews')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('town_city')
                    ->label('Location')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\IconColumn::make('approved_at')
                    ->label('Approved')
                    ->boolean()
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
                Tables\Filters\SelectFilter::make('type')
                    ->relationship('type', 'name')
                    ->multiple()
                    ->preload(),
                Tables\Filters\Filter::make('approved')
                    ->label('Approved Providers')
                    ->query(fn (Builder $query): Builder => $query->whereNotNull('approved_at')),
                Tables\Filters\Filter::make('pending_approval')
                    ->label('Pending Approval')
                    ->query(fn (Builder $query): Builder => $query->whereNull('approved_at')),
                Tables\Filters\TrashedFilter::make(),
            ])
            ->actions([
                Tables\Actions\ActionGroup::make([
                    Tables\Actions\ViewAction::make(),
                    Tables\Actions\EditAction::make(),
                    Tables\Actions\Action::make('approve')
                        ->label('Approve')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->visible(fn (Provider $record): bool => $record->approved_at === null)
                        ->requiresConfirmation()
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
                                ->title('Provider Approved')
                                ->success()
                                ->send();
                        }),
                    Tables\Actions\Action::make('reject')
                        ->label('Reject')
                        ->icon('heroicon-o-x-circle')
                        ->color('danger')
                        ->visible(fn (Provider $record): bool => $record->approved_at === null)
                        ->requiresConfirmation()
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
                                ->body('The provider has been notified.')
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
            'index' => Pages\ListProviders::route('/'),
            'create' => Pages\CreateProvider::route('/create'),
            'view' => Pages\ViewProvider::route('/{record}'),
            'edit' => Pages\EditProvider::route('/{record}/edit'),
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
