<?php

namespace Database\Seeders;

use App\Models\CollectionType;
use App\Models\Service;
use App\Models\ServiceCollectionMapping;
use Illuminate\Database\Seeder;

class ServiceCollectionMappingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Links all active services to both collection types (Home Visit and Clinic)
     */
    public function run(): void
    {
        $homeVisit = CollectionType::where('name', 'Home Visit')->first();
        $clinic = CollectionType::where('name', 'Clinic')->first();

        if (! $homeVisit || ! $clinic) {
            $this->command->error('Collection types not found. Run CollectionTypeSeeder first.');

            return;
        }

        $services = Service::where('is_active', true)->get();

        if ($services->isEmpty()) {
            $this->command->warn('No active services found. Run ServiceSeeder first.');

            return;
        }

        $mappingsCreated = 0;

        foreach ($services as $service) {
            ServiceCollectionMapping::firstOrCreate([
                'service_id' => $service->id,
                'collection_type_id' => $homeVisit->id,
            ], [
                'additional_cost' => 0.00,
                'description_html' => null,
                'created_at' => now(),
            ]);

            ServiceCollectionMapping::firstOrCreate([
                'service_id' => $service->id,
                'collection_type_id' => $clinic->id,
            ], [
                'additional_cost' => 0.00,
                'description_html' => null,
                'created_at' => now(),
            ]);

            $mappingsCreated += 2;
        }

        $this->command->info('Service collection mappings seeded successfully!');
        $this->command->info("Created {$mappingsCreated} mappings for {$services->count()} services.");
    }
}
