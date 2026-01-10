<?php

namespace Database\Seeders;

use App\Models\CollectionType;
use Illuminate\Database\Seeder;

class CollectionTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            [
                'name' => 'Home Visit',
                'icon_class' => 'fas fa-home',
                'display_order' => 1,
                'description' => 'Service performed at patient\'s home',
            ],
            [
                'name' => 'Clinic',
                'icon_class' => 'fas fa-hospital',
                'display_order' => 2,
                'description' => 'Service performed at clinic location',
            ],
        ];

        foreach ($types as $type) {
            CollectionType::firstOrCreate(
                ['name' => $type['name']],
                $type
            );
        }
    }
}
