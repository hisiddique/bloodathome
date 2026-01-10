<?php

namespace Database\Seeders;

use App\Models\ServiceCategory;
use Illuminate\Database\Seeder;

class ServiceCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Blood Test',
                'description' => 'Blood testing and analysis services',
            ],
            [
                'name' => 'X-Ray',
                'description' => 'X-ray imaging services',
            ],
            [
                'name' => 'ECG',
                'description' => 'Electrocardiogram testing',
            ],
            [
                'name' => 'Ultrasound',
                'description' => 'Ultrasound imaging services',
            ],
            [
                'name' => 'General Health Check',
                'description' => 'Comprehensive general health checkup',
            ],
        ];

        foreach ($categories as $category) {
            ServiceCategory::firstOrCreate(
                ['name' => $category['name']],
                $category
            );
        }
    }
}
