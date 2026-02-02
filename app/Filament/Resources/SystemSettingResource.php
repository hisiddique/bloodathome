<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SystemSettingResource\Pages;
use App\Models\SystemSetting;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class SystemSettingResource extends Resource
{
    protected static ?string $model = SystemSetting::class;

    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';

    protected static ?string $navigationLabel = 'Settings';

    protected static ?string $navigationGroup = 'System';

    protected static ?int $navigationSort = 10;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Setting Information')
                    ->schema([
                        Forms\Components\TextInput::make('key')
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->maxLength(255)
                            ->helperText('Use dot notation (e.g., branding.app_name)'),
                        Forms\Components\Select::make('group')
                            ->required()
                            ->options([
                                'general' => 'General',
                                'branding' => 'Branding',
                                'api' => 'API Keys',
                                'platform' => 'Platform',
                                'notifications' => 'Notifications',
                            ])
                            ->default('general'),
                        Forms\Components\Select::make('type')
                            ->required()
                            ->options([
                                'string' => 'String',
                                'integer' => 'Integer',
                                'float' => 'Float',
                                'boolean' => 'Boolean',
                                'array' => 'Array',
                                'json' => 'JSON',
                            ])
                            ->default('string')
                            ->reactive(),
                    ])->columns(2),
                Forms\Components\Section::make('Setting Value')
                    ->schema([
                        Forms\Components\Textarea::make('value')
                            ->label('Value')
                            ->rows(3)
                            ->helperText(fn (Forms\Get $get): string => match ($get('type')) {
                                'boolean' => 'Enter: true or false',
                                'array', 'json' => 'Enter valid JSON',
                                default => '',
                            }),
                        Forms\Components\Textarea::make('description')
                            ->rows(2)
                            ->columnSpanFull(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('key')
                    ->searchable()
                    ->sortable()
                    ->weight('medium'),
                Tables\Columns\TextColumn::make('value')
                    ->limit(50)
                    ->searchable()
                    ->formatStateUsing(function ($state, $record): string {
                        if (Str::contains($record->key, ['secret', 'password', 'key', 'token'])) {
                            return '********';
                        }

                        return Str::limit($state, 50);
                    }),
                Tables\Columns\TextColumn::make('type')
                    ->badge()
                    ->sortable(),
                Tables\Columns\TextColumn::make('group')
                    ->badge()
                    ->sortable()
                    ->color(fn (string $state): string => match ($state) {
                        'branding' => 'info',
                        'api' => 'warning',
                        'platform' => 'success',
                        'notifications' => 'primary',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('group')
                    ->options([
                        'general' => 'General',
                        'branding' => 'Branding',
                        'api' => 'API Keys',
                        'platform' => 'Platform',
                        'notifications' => 'Notifications',
                    ])
                    ->multiple()
                    ->preload(),
                Tables\Filters\SelectFilter::make('type')
                    ->options([
                        'string' => 'String',
                        'integer' => 'Integer',
                        'float' => 'Float',
                        'boolean' => 'Boolean',
                        'array' => 'Array',
                        'json' => 'JSON',
                    ])
                    ->multiple()
                    ->preload(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->groups([
                Tables\Grouping\Group::make('group')
                    ->label('Group')
                    ->collapsible(),
            ])
            ->defaultSort('key');
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
            'index' => Pages\ListSystemSettings::route('/'),
            'create' => Pages\CreateSystemSetting::route('/create'),
            'edit' => Pages\EditSystemSetting::route('/{record}/edit'),
        ];
    }
}
