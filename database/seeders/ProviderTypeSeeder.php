<?php

namespace Database\Seeders;

use App\Models\ProviderType;
use Illuminate\Database\Seeder;

class ProviderTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            [
                'name' => 'Individual',
                'description' => 'Individual phlebotomist or healthcare professional',
            ],
            [
                'name' => 'Laboratory',
                'description' => 'Medical laboratory provider',
            ],
            [
                'name' => 'Clinic',
                'description' => 'Medical clinic or healthcare facility',
            ],
        ];

        foreach ($types as $type) {
            ProviderType::firstOrCreate(
                ['name' => $type['name']],
                $type
            );
        }
    }
}
