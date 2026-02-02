<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ReviewResource\Pages;
use App\Models\Review;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ReviewResource extends Resource
{
    protected static ?string $model = Review::class;

    protected static ?string $navigationIcon = 'heroicon-o-star';

    protected static ?string $navigationGroup = 'Content';

    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Review Information')
                    ->schema([
                        Forms\Components\Select::make('booking_id')
                            ->relationship('booking', 'confirmation_number')
                            ->searchable()
                            ->required()
                            ->disabled(),
                        Forms\Components\Select::make('user_id')
                            ->relationship('user', 'name')
                            ->searchable()
                            ->required()
                            ->disabled(),
                        Forms\Components\Select::make('provider_id')
                            ->relationship('provider', 'provider_name')
                            ->searchable()
                            ->required()
                            ->disabled(),
                        Forms\Components\TextInput::make('rating')
                            ->required()
                            ->numeric()
                            ->minValue(1)
                            ->maxValue(5)
                            ->disabled(),
                    ])->columns(2),
                Forms\Components\Section::make('Review Content')
                    ->schema([
                        Forms\Components\Textarea::make('review_text')
                            ->label('Review')
                            ->rows(5)
                            ->disabled()
                            ->columnSpanFull(),
                        Forms\Components\Toggle::make('is_published')
                            ->label('Published')
                            ->inline(false)
                            ->helperText('Publish this review to be visible on the provider profile'),
                    ]),
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
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Patient')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('provider.user.name')
                    ->label('Provider')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('rating')
                    ->sortable()
                    ->icon('heroicon-m-star')
                    ->iconColor('warning')
                    ->formatStateUsing(fn (int $state): string => "{$state}/5"),
                Tables\Columns\TextColumn::make('review_text')
                    ->label('Comment')
                    ->limit(50)
                    ->searchable()
                    ->tooltip(function (Tables\Columns\TextColumn $column): ?string {
                        $state = $column->getState();

                        if (strlen($state) <= 50) {
                            return null;
                        }

                        return $state;
                    }),
                Tables\Columns\IconColumn::make('is_published')
                    ->label('Published')
                    ->boolean()
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Date')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('rating')
                    ->options([
                        5 => '5 Stars',
                        4 => '4 Stars',
                        3 => '3 Stars',
                        2 => '2 Stars',
                        1 => '1 Star',
                    ])
                    ->multiple(),
                Tables\Filters\TernaryFilter::make('is_published')
                    ->label('Published Status')
                    ->placeholder('All reviews')
                    ->trueLabel('Published only')
                    ->falseLabel('Unpublished only'),
                Tables\Filters\SelectFilter::make('provider_id')
                    ->label('Provider')
                    ->relationship('provider', 'provider_name')
                    ->searchable()
                    ->preload(),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\Action::make('approve')
                    ->label('Approve')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn (Review $record): bool => ! $record->is_published)
                    ->requiresConfirmation()
                    ->action(function (Review $record): void {
                        $record->update(['is_published' => true]);

                        Notification::make()
                            ->title('Review approved and published')
                            ->success()
                            ->send();
                    }),
                Tables\Actions\Action::make('reject')
                    ->label('Unpublish')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->visible(fn (Review $record): bool => $record->is_published)
                    ->requiresConfirmation()
                    ->action(function (Review $record): void {
                        $record->update(['is_published' => false]);

                        Notification::make()
                            ->title('Review unpublished')
                            ->success()
                            ->send();
                    }),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\BulkAction::make('approve')
                        ->label('Approve Selected')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->requiresConfirmation()
                        ->action(function ($records): void {
                            $records->each->update(['is_published' => true]);

                            Notification::make()
                                ->title('Reviews approved')
                                ->success()
                                ->send();
                        }),
                    Tables\Actions\BulkAction::make('unpublish')
                        ->label('Unpublish Selected')
                        ->icon('heroicon-o-x-circle')
                        ->color('warning')
                        ->requiresConfirmation()
                        ->action(function ($records): void {
                            $records->each->update(['is_published' => false]);

                            Notification::make()
                                ->title('Reviews unpublished')
                                ->success()
                                ->send();
                        }),
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
            'index' => Pages\ListReviews::route('/'),
            'view' => Pages\ViewReview::route('/{record}'),
        ];
    }
}
