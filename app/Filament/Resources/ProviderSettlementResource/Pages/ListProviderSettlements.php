<?php

namespace App\Filament\Resources\ProviderSettlementResource\Pages;

use App\Filament\Resources\ProviderSettlementResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListProviderSettlements extends ListRecords
{
    protected static string $resource = ProviderSettlementResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
