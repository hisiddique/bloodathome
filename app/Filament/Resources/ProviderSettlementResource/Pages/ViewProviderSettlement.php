<?php

namespace App\Filament\Resources\ProviderSettlementResource\Pages;

use App\Filament\Resources\ProviderSettlementResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewProviderSettlement extends ViewRecord
{
    protected static string $resource = ProviderSettlementResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }
}
