<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $bloodTestCategory = ServiceCategory::where('name', 'Blood Test')->first();

        if (! $bloodTestCategory) {
            $this->command->error('Blood Test category not found. Run ServiceCategorySeeder first.');

            return;
        }

        $services = [
            [
                'service_category_id' => $bloodTestCategory->id,
                'service_name' => 'Full Blood Count (FBC)',
                'service_code' => 'BT_FBC',
                'service_description' => 'Complete blood cell analysis including red cells, white cells, and platelets',
                'is_active' => true,
            ],
            [
                'service_category_id' => $bloodTestCategory->id,
                'service_name' => 'Liver Function Test (LFT)',
                'service_code' => 'BT_LFT',
                'service_description' => 'Measures enzymes and proteins to assess liver health',
                'is_active' => true,
            ],
            [
                'service_category_id' => $bloodTestCategory->id,
                'service_name' => 'Kidney Function Test (U&E)',
                'service_code' => 'BT_KFT',
                'service_description' => 'Urea, creatinine, and electrolytes to assess kidney health',
                'is_active' => true,
            ],
            [
                'service_category_id' => $bloodTestCategory->id,
                'service_name' => 'Thyroid Function Panel (TFT)',
                'service_code' => 'BT_TFT',
                'service_description' => 'TSH, T3, T4 levels for thyroid health assessment',
                'is_active' => true,
            ],
            [
                'service_category_id' => $bloodTestCategory->id,
                'service_name' => 'Lipid Profile',
                'service_code' => 'BT_LIPID',
                'service_description' => 'Cholesterol and triglyceride levels for cardiovascular health',
                'is_active' => true,
            ],
            [
                'service_category_id' => $bloodTestCategory->id,
                'service_name' => 'HbA1c (Diabetes)',
                'service_code' => 'BT_HBA1C',
                'service_description' => 'Average blood glucose over past 2-3 months',
                'is_active' => true,
            ],
            [
                'service_category_id' => $bloodTestCategory->id,
                'service_name' => 'Vitamin D',
                'service_code' => 'BT_VITD',
                'service_description' => '25-hydroxyvitamin D level assessment',
                'is_active' => true,
            ],
            [
                'service_category_id' => $bloodTestCategory->id,
                'service_name' => 'Vitamin B12',
                'service_code' => 'BT_VITB12',
                'service_description' => 'B12 deficiency screening',
                'is_active' => true,
            ],
            [
                'service_category_id' => $bloodTestCategory->id,
                'service_name' => 'Iron Studies',
                'service_code' => 'BT_IRON',
                'service_description' => 'Serum iron, ferritin, TIBC for iron deficiency',
                'is_active' => true,
            ],
            [
                'service_category_id' => $bloodTestCategory->id,
                'service_name' => 'Full Blood Profile',
                'service_code' => 'BT_FULL',
                'service_description' => 'Comprehensive panel including FBC, LFT, U&E, Lipids',
                'is_active' => true,
            ],
            [
                'service_category_id' => $bloodTestCategory->id,
                'service_name' => 'Hormone Panel (Male)',
                'service_code' => 'BT_HORM_M',
                'service_description' => 'Testosterone, FSH, LH, SHBG',
                'is_active' => true,
            ],
            [
                'service_category_id' => $bloodTestCategory->id,
                'service_name' => 'Hormone Panel (Female)',
                'service_code' => 'BT_HORM_F',
                'service_description' => 'Oestrogen, progesterone, FSH, LH',
                'is_active' => true,
            ],
            [
                'service_category_id' => $bloodTestCategory->id,
                'service_name' => 'Sexual Health Screen',
                'service_code' => 'BT_STI',
                'service_description' => 'HIV, Hepatitis B&C, Syphilis',
                'is_active' => true,
            ],
            [
                'service_category_id' => $bloodTestCategory->id,
                'service_name' => 'Allergy Panel',
                'service_code' => 'BT_ALLERGY',
                'service_description' => 'Common allergen IgE testing',
                'is_active' => true,
            ],
        ];

        foreach ($services as $service) {
            Service::firstOrCreate(
                ['service_code' => $service['service_code']],
                $service
            );
        }

        $this->command->info('Services seeded successfully!');
        $this->command->info('Created '.count($services).' blood test services.');
    }
}
