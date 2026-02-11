<?php

namespace Database\Seeders;

use App\Models\Patient;
use App\Models\Provider;
use App\Models\ProviderAvailability;
use App\Models\ProviderService;
use App\Models\ProviderServiceArea;
use App\Models\ProviderStatus;
use App\Models\ProviderType;
use App\Models\Service;
use App\Models\ServiceActiveStatus;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@bloodathome.com'],
            [
                'first_name' => 'Admin',
                'last_name' => 'User',
                'date_of_birth' => '1980-01-01',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (! $admin->hasRole('super_admin')) {
            $admin->assignRole('super_admin');
        }

        $providerUser = User::firstOrCreate(
            ['email' => 'provider@bloodathome.com'],
            [
                'first_name' => 'Sarah',
                'last_name' => 'Johnson',
                'date_of_birth' => '1988-05-15',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (! $providerUser->hasRole('provider')) {
            $providerUser->assignRole('provider');
        }

        $activeStatus = ProviderStatus::where('name', 'Active')->first();
        $individualType = ProviderType::where('name', 'Individual')->first();

        Provider::firstOrCreate(
            ['user_id' => $providerUser->id],
            [
                'type_id' => $individualType?->id ?? 1,
                'status_id' => $activeStatus?->id ?? 1,
                'provider_name' => 'Sarah Johnson Phlebotomy',
                'address_line1' => '123 Medical Centre',
                'town_city' => 'London',
                'postcode' => 'SW1A 1AA',
                'bio' => 'Experienced phlebotomist with 10+ years in clinical settings. Specializing in home visits for elderly and mobility-impaired patients.',
                'experience_years' => 10,
                'average_rating' => 4.8,
                'total_reviews' => 45,
                'approved_at' => now(),
                'approved_by' => $admin->id,
            ]
        );

        $pendingProviderUser = User::firstOrCreate(
            ['email' => 'pending-provider@bloodathome.com'],
            [
                'first_name' => 'Michael',
                'last_name' => 'Brown',
                'date_of_birth' => '1992-08-20',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (! $pendingProviderUser->hasRole('provider')) {
            $pendingProviderUser->assignRole('provider');
        }

        $pendingStatus = ProviderStatus::where('name', 'Pending')->first();

        Provider::firstOrCreate(
            ['user_id' => $pendingProviderUser->id],
            [
                'type_id' => $individualType?->id ?? 1,
                'status_id' => $pendingStatus?->id ?? 3,
                'provider_name' => 'Michael Brown Healthcare',
                'address_line1' => '456 Health Street',
                'town_city' => 'Manchester',
                'postcode' => 'M1 1AA',
                'bio' => 'Newly qualified phlebotomist seeking to provide quality home blood collection services.',
                'experience_years' => 2,
            ]
        );

        $patientUser = User::firstOrCreate(
            ['email' => 'patient@bloodathome.com'],
            [
                'first_name' => 'John',
                'last_name' => 'Smith',
                'date_of_birth' => '1985-06-15',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (! $patientUser->hasRole('patient')) {
            $patientUser->assignRole('patient');
        }

        Patient::firstOrCreate(
            ['user_id' => $patientUser->id],
            [
                'nhs_number' => '1234567890',
                'date_of_birth' => '1985-06-15',
                'known_blood_type' => 'O+',
            ]
        );

        $patientUser2 = User::firstOrCreate(
            ['email' => 'emily@bloodathome.com'],
            [
                'first_name' => 'Emily',
                'last_name' => 'Davis',
                'date_of_birth' => '1990-03-22',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (! $patientUser2->hasRole('patient')) {
            $patientUser2->assignRole('patient');
        }

        Patient::firstOrCreate(
            ['user_id' => $patientUser2->id],
            [
                'nhs_number' => '9876543210',
                'date_of_birth' => '1990-03-22',
                'known_blood_type' => 'A+',
            ]
        );

        $this->createLondonProviders($admin);

        $this->command->info('Test users created successfully!');
        $this->command->table(
            ['Role', 'Email', 'Password'],
            [
                ['Super Admin', 'admin@bloodathome.com', 'password'],
                ['Provider (Active)', 'provider@bloodathome.com', 'password'],
                ['Provider (Pending)', 'pending-provider@bloodathome.com', 'password'],
                ['Provider 1 (London)', 'sarah.johnson@bloodathome.com', 'password'],
                ['Provider 2 (London)', 'michael.chen@bloodathome.com', 'password'],
                ['Provider 3 (London)', 'north.london.clinic@bloodathome.com', 'password'],
                ['Provider 4 (London)', 'emma.williams@bloodathome.com', 'password'],
                ['Provider 5 (London)', 'city.diagnostics@bloodathome.com', 'password'],
                ['Cluster Test (Same Loc)', 'james.clark@bloodathome.com', 'password'],
                ['Cluster Test (Same Loc)', 'olivia.patel@bloodathome.com', 'password'],
                ['Cluster Test (Same Loc)', 'david.wilson@bloodathome.com', 'password'],
                ['Cluster Test (Close)', 'lisa.thompson@bloodathome.com', 'password'],
                ['Cluster Test (Close)', 'robert.garcia@bloodathome.com', 'password'],
                ['Cluster Test (Close)', 'sophie.lee@bloodathome.com', 'password'],
                ['Cluster Test (Close)', 'mark.taylor@bloodathome.com', 'password'],
                ['Patient', 'patient@bloodathome.com', 'password'],
                ['Patient', 'emily@bloodathome.com', 'password'],
            ]
        );
    }

    private function createLondonProviders(User $admin): void
    {
        $this->createProvider1($admin);
        $this->createProvider2($admin);
        $this->createProvider3($admin);
        $this->createProvider4($admin);
        $this->createProvider5($admin);

        // Create clustered providers for testing map clustering and spiderfy
        $this->createClusteredProviders($admin);
    }

    /**
     * Create providers at same/nearby locations to test map clustering and spiderfy.
     */
    private function createClusteredProviders(User $admin): void
    {
        $activeStatus = ProviderStatus::where('name', 'Active')->first();
        $individualType = ProviderType::where('name', 'Individual')->first();

        // Group 1: Same exact location (Westminster area) - for spiderfy testing
        $sameLocationProviders = [
            [
                'email' => 'james.clark@bloodathome.com',
                'first_name' => 'James',
                'last_name' => 'Clark',
                'provider_name' => 'James Clark Phlebotomy',
                'latitude' => 51.5014,
                'longitude' => -0.1419,
                'rating' => 4.6,
                'reviews' => 32,
                'experience' => 6,
            ],
            [
                'email' => 'olivia.patel@bloodathome.com',
                'first_name' => 'Olivia',
                'last_name' => 'Patel',
                'provider_name' => 'Olivia Patel Health Services',
                'latitude' => 51.5014,
                'longitude' => -0.1419,
                'rating' => 4.9,
                'reviews' => 58,
                'experience' => 9,
            ],
            [
                'email' => 'david.wilson@bloodathome.com',
                'first_name' => 'David',
                'last_name' => 'Wilson',
                'provider_name' => 'David Wilson Mobile Phlebotomy',
                'latitude' => 51.5014,
                'longitude' => -0.1419,
                'rating' => 4.4,
                'reviews' => 15,
                'experience' => 3,
            ],
        ];

        // Group 2: Very close locations (Soho area) - for cluster testing
        $closeLocationProviders = [
            [
                'email' => 'lisa.thompson@bloodathome.com',
                'first_name' => 'Lisa',
                'last_name' => 'Thompson',
                'provider_name' => 'Lisa Thompson - Soho Phlebotomist',
                'latitude' => 51.5137,
                'longitude' => -0.1337,
                'rating' => 4.7,
                'reviews' => 41,
                'experience' => 7,
            ],
            [
                'email' => 'robert.garcia@bloodathome.com',
                'first_name' => 'Robert',
                'last_name' => 'Garcia',
                'provider_name' => 'Robert Garcia Health',
                'latitude' => 51.5140,
                'longitude' => -0.1340,
                'rating' => 4.5,
                'reviews' => 28,
                'experience' => 4,
            ],
            [
                'email' => 'sophie.lee@bloodathome.com',
                'first_name' => 'Sophie',
                'last_name' => 'Lee',
                'provider_name' => 'Sophie Lee Blood Tests',
                'latitude' => 51.5135,
                'longitude' => -0.1335,
                'rating' => 4.8,
                'reviews' => 63,
                'experience' => 11,
            ],
            [
                'email' => 'mark.taylor@bloodathome.com',
                'first_name' => 'Mark',
                'last_name' => 'Taylor',
                'provider_name' => 'Mark Taylor Phlebotomy Services',
                'latitude' => 51.5138,
                'longitude' => -0.1342,
                'rating' => 4.3,
                'reviews' => 19,
                'experience' => 2,
            ],
        ];

        $allProviders = array_merge($sameLocationProviders, $closeLocationProviders);

        // Define varied schedules for each clustered provider
        $scheduleVariations = [
            // 0: James Clark - Mon/Wed/Fri mornings only
            [
                ['day' => 1, 'start' => '08:00', 'end' => '12:00'],
                ['day' => 3, 'start' => '08:00', 'end' => '12:00'],
                ['day' => 5, 'start' => '08:00', 'end' => '12:00'],
            ],
            // 1: Olivia Patel - Mon-Thu split
            [
                ['day' => 1, 'start' => '09:00', 'end' => '13:00'],
                ['day' => 1, 'start' => '15:00', 'end' => '19:00'],
                ['day' => 2, 'start' => '09:00', 'end' => '13:00'],
                ['day' => 2, 'start' => '15:00', 'end' => '19:00'],
                ['day' => 3, 'start' => '09:00', 'end' => '13:00'],
                ['day' => 3, 'start' => '15:00', 'end' => '19:00'],
                ['day' => 4, 'start' => '09:00', 'end' => '13:00'],
                ['day' => 4, 'start' => '15:00', 'end' => '19:00'],
            ],
            // 2: David Wilson - Wed-Fri short
            [
                ['day' => 3, 'start' => '10:00', 'end' => '14:00'],
                ['day' => 4, 'start' => '10:00', 'end' => '14:00'],
                ['day' => 5, 'start' => '10:00', 'end' => '14:00'],
            ],
            // 3: Lisa Thompson - Mon-Fri split
            [
                ['day' => 1, 'start' => '07:00', 'end' => '11:00'],
                ['day' => 1, 'start' => '14:00', 'end' => '18:00'],
                ['day' => 2, 'start' => '07:00', 'end' => '11:00'],
                ['day' => 2, 'start' => '14:00', 'end' => '18:00'],
                ['day' => 3, 'start' => '07:00', 'end' => '11:00'],
                ['day' => 3, 'start' => '14:00', 'end' => '18:00'],
                ['day' => 4, 'start' => '07:00', 'end' => '11:00'],
                ['day' => 4, 'start' => '14:00', 'end' => '18:00'],
                ['day' => 5, 'start' => '07:00', 'end' => '11:00'],
                ['day' => 5, 'start' => '14:00', 'end' => '18:00'],
            ],
            // 4: Robert Garcia - Tue-Thu continuous
            [
                ['day' => 2, 'start' => '09:00', 'end' => '17:00'],
                ['day' => 3, 'start' => '09:00', 'end' => '17:00'],
                ['day' => 4, 'start' => '09:00', 'end' => '17:00'],
            ],
            // 5: Sophie Lee - Mon-Sat fragmented
            [
                ['day' => 1, 'start' => '08:00', 'end' => '10:00'],
                ['day' => 1, 'start' => '12:00', 'end' => '14:00'],
                ['day' => 1, 'start' => '16:00', 'end' => '18:00'],
                ['day' => 2, 'start' => '08:00', 'end' => '10:00'],
                ['day' => 2, 'start' => '12:00', 'end' => '14:00'],
                ['day' => 2, 'start' => '16:00', 'end' => '18:00'],
                ['day' => 3, 'start' => '08:00', 'end' => '10:00'],
                ['day' => 3, 'start' => '12:00', 'end' => '14:00'],
                ['day' => 3, 'start' => '16:00', 'end' => '18:00'],
                ['day' => 4, 'start' => '08:00', 'end' => '10:00'],
                ['day' => 4, 'start' => '12:00', 'end' => '14:00'],
                ['day' => 4, 'start' => '16:00', 'end' => '18:00'],
                ['day' => 5, 'start' => '08:00', 'end' => '10:00'],
                ['day' => 5, 'start' => '12:00', 'end' => '14:00'],
                ['day' => 5, 'start' => '16:00', 'end' => '18:00'],
                ['day' => 6, 'start' => '08:00', 'end' => '10:00'],
                ['day' => 6, 'start' => '12:00', 'end' => '14:00'],
                ['day' => 6, 'start' => '16:00', 'end' => '18:00'],
            ],
            // 6: Mark Taylor - Mon-Fri afternoons only
            [
                ['day' => 1, 'start' => '13:00', 'end' => '17:00'],
                ['day' => 2, 'start' => '13:00', 'end' => '17:00'],
                ['day' => 3, 'start' => '13:00', 'end' => '17:00'],
                ['day' => 4, 'start' => '13:00', 'end' => '17:00'],
                ['day' => 5, 'start' => '13:00', 'end' => '17:00'],
            ],
        ];

        foreach ($allProviders as $index => $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'first_name' => $data['first_name'],
                    'last_name' => $data['last_name'],
                    'date_of_birth' => fake()->dateTimeBetween('-50 years', '-25 years')->format('Y-m-d'),
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );
            if (! $user->hasRole('provider')) {
                $user->assignRole('provider');
            }

            $provider = Provider::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'type_id' => $individualType->id,
                    'status_id' => $activeStatus->id,
                    'provider_name' => $data['provider_name'],
                    'address_line1' => '123 Test Street',
                    'town_city' => 'London',
                    'postcode' => 'W1D 3QE',
                    'latitude' => $data['latitude'],
                    'longitude' => $data['longitude'],
                    'bio' => 'Professional phlebotomist providing quality blood collection services.',
                    'experience_years' => $data['experience'],
                    'average_rating' => $data['rating'],
                    'total_reviews' => $data['reviews'],
                    'show_image_in_search' => true,
                    'approved_at' => now(),
                    'approved_by' => $admin->id,
                ]
            );

            // Add some services with varying prices
            $this->createProviderServices($provider, [
                ['code' => 'BT_FBC', 'price' => rand(30, 40) + 0.00],
                ['code' => 'BT_LFT', 'price' => rand(40, 50) + 0.00],
                ['code' => 'BT_VITD', 'price' => rand(30, 40) + 0.00],
            ]);

            // Assign different schedule to each provider based on index
            $this->createProviderAvailability($provider, $scheduleVariations[$index]);

            $this->createProviderServiceAreas($provider, ['W1', 'WC1', 'WC2', 'SW1']);
        }

        $this->command->info('Created clustered providers for map testing');
    }

    private function createProvider1(User $admin): void
    {
        $user = User::firstOrCreate(
            ['email' => 'sarah.johnson@bloodathome.com'],
            [
                'first_name' => 'Sarah',
                'last_name' => 'Johnson',
                'date_of_birth' => '1990-04-10',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (! $user->hasRole('provider')) {
            $user->assignRole('provider');
        }

        $activeStatus = ProviderStatus::where('name', 'Active')->first();
        $individualType = ProviderType::where('name', 'Individual')->first();

        $provider = Provider::firstOrCreate(
            ['user_id' => $user->id],
            [
                'type_id' => $individualType->id,
                'status_id' => $activeStatus->id,
                'provider_name' => 'Sarah Johnson - Central London Phlebotomist',
                'address_line1' => '10 Harley Street',
                'town_city' => 'London',
                'postcode' => 'W1G 9PF',
                'latitude' => 51.5074,
                'longitude' => -0.1278,
                'bio' => 'Experienced phlebotomist with 8 years in NHS and private practice. Specializing in home visits for nervous patients and children. Gentle, patient-centered approach.',
                'experience_years' => 8,
                'average_rating' => 4.8,
                'total_reviews' => 25,
                'show_image_in_search' => true,
                'approved_at' => now(),
                'approved_by' => $admin->id,
            ]
        );

        $this->createProviderServices($provider, [
            ['code' => 'BT_FBC', 'price' => 35.00],
            ['code' => 'BT_LFT', 'price' => 45.00],
            ['code' => 'BT_VITD', 'price' => 35.00],
            ['code' => 'BT_VITB12', 'price' => 35.00],
        ]);

        // Mon-Fri split schedule with lunch break: 08:00-12:00, 14:00-18:00
        $this->createProviderAvailability($provider, [
            ['day' => 1, 'start' => '08:00', 'end' => '12:00'],
            ['day' => 1, 'start' => '14:00', 'end' => '18:00'],
            ['day' => 2, 'start' => '08:00', 'end' => '12:00'],
            ['day' => 2, 'start' => '14:00', 'end' => '18:00'],
            ['day' => 3, 'start' => '08:00', 'end' => '12:00'],
            ['day' => 3, 'start' => '14:00', 'end' => '18:00'],
            ['day' => 4, 'start' => '08:00', 'end' => '12:00'],
            ['day' => 4, 'start' => '14:00', 'end' => '18:00'],
            ['day' => 5, 'start' => '08:00', 'end' => '12:00'],
            ['day' => 5, 'start' => '14:00', 'end' => '18:00'],
        ]);

        $this->createProviderServiceAreas($provider, ['SW1', 'SW3', 'SW7', 'W1', 'WC1', 'WC2']);
    }

    private function createProvider2(User $admin): void
    {
        $user = User::firstOrCreate(
            ['email' => 'michael.chen@bloodathome.com'],
            [
                'first_name' => 'Michael',
                'last_name' => 'Chen',
                'date_of_birth' => '1982-11-25',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (! $user->hasRole('provider')) {
            $user->assignRole('provider');
        }

        $activeStatus = ProviderStatus::where('name', 'Active')->first();
        $individualType = ProviderType::where('name', 'Individual')->first();

        $provider = Provider::firstOrCreate(
            ['user_id' => $user->id],
            [
                'type_id' => $individualType->id,
                'status_id' => $activeStatus->id,
                'provider_name' => 'Dr. Michael Chen - Mobile Phlebotomy',
                'address_line1' => '45 Victoria Street',
                'town_city' => 'London',
                'postcode' => 'SW1H 0EU',
                'latitude' => 51.4975,
                'longitude' => -0.1357,
                'bio' => 'Senior phlebotomist with 12 years experience in hospital and community settings. Specialist in difficult venous access and geriatric care.',
                'experience_years' => 12,
                'average_rating' => 4.9,
                'total_reviews' => 42,
                'show_image_in_search' => true,
                'approved_at' => now(),
                'approved_by' => $admin->id,
            ]
        );

        $this->createProviderServices($provider, [
            ['code' => 'BT_FBC', 'price' => 35.00],
            ['code' => 'BT_LFT', 'price' => 45.00],
            ['code' => 'BT_KFT', 'price' => 45.00],
            ['code' => 'BT_TFT', 'price' => 55.00],
            ['code' => 'BT_LIPID', 'price' => 40.00],
            ['code' => 'BT_HBA1C', 'price' => 35.00],
            ['code' => 'BT_VITD', 'price' => 35.00],
            ['code' => 'BT_FULL', 'price' => 85.00],
        ]);

        // Mon-Sat, three blocks per day
        // Mon-Fri: 07:00-11:00, 13:00-17:00, 18:00-20:00
        // Sat: 07:00-11:00, 13:00-17:00
        $this->createProviderAvailability($provider, [
            ['day' => 1, 'start' => '07:00', 'end' => '11:00'],
            ['day' => 1, 'start' => '13:00', 'end' => '17:00'],
            ['day' => 1, 'start' => '18:00', 'end' => '20:00'],
            ['day' => 2, 'start' => '07:00', 'end' => '11:00'],
            ['day' => 2, 'start' => '13:00', 'end' => '17:00'],
            ['day' => 2, 'start' => '18:00', 'end' => '20:00'],
            ['day' => 3, 'start' => '07:00', 'end' => '11:00'],
            ['day' => 3, 'start' => '13:00', 'end' => '17:00'],
            ['day' => 3, 'start' => '18:00', 'end' => '20:00'],
            ['day' => 4, 'start' => '07:00', 'end' => '11:00'],
            ['day' => 4, 'start' => '13:00', 'end' => '17:00'],
            ['day' => 4, 'start' => '18:00', 'end' => '20:00'],
            ['day' => 5, 'start' => '07:00', 'end' => '11:00'],
            ['day' => 5, 'start' => '13:00', 'end' => '17:00'],
            ['day' => 5, 'start' => '18:00', 'end' => '20:00'],
            ['day' => 6, 'start' => '07:00', 'end' => '11:00'],
            ['day' => 6, 'start' => '13:00', 'end' => '17:00'],
        ]);

        $this->createProviderServiceAreas($provider, ['SW1', 'W1', 'W2', 'WC1', 'WC2', 'EC1']);
    }

    private function createProvider3(User $admin): void
    {
        $user = User::firstOrCreate(
            ['email' => 'north.london.clinic@bloodathome.com'],
            [
                'first_name' => 'North London',
                'last_name' => 'Clinic',
                'date_of_birth' => '1975-01-01',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (! $user->hasRole('provider')) {
            $user->assignRole('provider');
        }

        $activeStatus = ProviderStatus::where('name', 'Active')->first();
        $clinicType = ProviderType::where('name', 'Clinic')->first();

        $provider = Provider::firstOrCreate(
            ['user_id' => $user->id],
            [
                'type_id' => $clinicType->id,
                'status_id' => $activeStatus->id,
                'provider_name' => 'North London Blood Clinic',
                'address_line1' => '234 Camden High Street',
                'town_city' => 'London',
                'postcode' => 'NW1 8QS',
                'latitude' => 51.5390,
                'longitude' => -0.1426,
                'bio' => 'Modern clinic offering comprehensive blood testing services. Walk-ins welcome. State-of-the-art facilities with comfortable waiting areas.',
                'experience_years' => null,
                'average_rating' => 4.6,
                'total_reviews' => 89,
                'show_image_in_search' => true,
                'approved_at' => now(),
                'approved_by' => $admin->id,
            ]
        );

        $this->createProviderServices($provider, [
            ['code' => 'BT_FBC', 'price' => 30.00],
            ['code' => 'BT_LFT', 'price' => 42.00],
            ['code' => 'BT_KFT', 'price' => 42.00],
            ['code' => 'BT_TFT', 'price' => 52.00],
            ['code' => 'BT_LIPID', 'price' => 38.00],
            ['code' => 'BT_HBA1C', 'price' => 32.00],
            ['code' => 'BT_VITD', 'price' => 32.00],
            ['code' => 'BT_VITB12', 'price' => 32.00],
            ['code' => 'BT_IRON', 'price' => 38.00],
            ['code' => 'BT_FULL', 'price' => 80.00],
        ]);

        $this->createProviderAvailability($provider, [
            ['day' => 1, 'start' => '08:00', 'end' => '18:00'],
            ['day' => 2, 'start' => '08:00', 'end' => '18:00'],
            ['day' => 3, 'start' => '08:00', 'end' => '18:00'],
            ['day' => 4, 'start' => '08:00', 'end' => '18:00'],
            ['day' => 5, 'start' => '08:00', 'end' => '18:00'],
            ['day' => 6, 'start' => '08:00', 'end' => '18:00'],
            ['day' => 0, 'start' => '08:00', 'end' => '18:00'],
        ]);

        $this->createProviderServiceAreas($provider, ['N1', 'NW1', 'NW3', 'NW5', 'WC1']);
    }

    private function createProvider4(User $admin): void
    {
        $user = User::firstOrCreate(
            ['email' => 'emma.williams@bloodathome.com'],
            [
                'first_name' => 'Emma',
                'last_name' => 'Williams',
                'date_of_birth' => '1993-07-18',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (! $user->hasRole('provider')) {
            $user->assignRole('provider');
        }

        $activeStatus = ProviderStatus::where('name', 'Active')->first();
        $individualType = ProviderType::where('name', 'Individual')->first();

        $provider = Provider::firstOrCreate(
            ['user_id' => $user->id],
            [
                'type_id' => $individualType->id,
                'status_id' => $activeStatus->id,
                'provider_name' => 'Emma Williams Phlebotomy Services',
                'address_line1' => '78 Kensington Church Street',
                'town_city' => 'London',
                'postcode' => 'W8 4BG',
                'latitude' => 51.4989,
                'longitude' => -0.1878,
                'bio' => 'Friendly phlebotomist with 5 years experience. Specializing in home visits for families and young professionals. Evening appointments available.',
                'experience_years' => 5,
                'average_rating' => 4.7,
                'total_reviews' => 18,
                'show_image_in_search' => true,
                'approved_at' => now(),
                'approved_by' => $admin->id,
            ]
        );

        $this->createProviderServices($provider, [
            ['code' => 'BT_FBC', 'price' => 38.00],
            ['code' => 'BT_LFT', 'price' => 48.00],
            ['code' => 'BT_VITD', 'price' => 38.00],
            ['code' => 'BT_VITB12', 'price' => 38.00],
            ['code' => 'BT_IRON', 'price' => 42.00],
        ]);

        // Short day, Tue-Sat, no split: 10:00-15:00
        $this->createProviderAvailability($provider, [
            ['day' => 2, 'start' => '10:00', 'end' => '15:00'],
            ['day' => 3, 'start' => '10:00', 'end' => '15:00'],
            ['day' => 4, 'start' => '10:00', 'end' => '15:00'],
            ['day' => 5, 'start' => '10:00', 'end' => '15:00'],
            ['day' => 6, 'start' => '10:00', 'end' => '15:00'],
        ]);

        $this->createProviderServiceAreas($provider, ['W8', 'W11', 'SW5', 'SW7']);
    }

    private function createProvider5(User $admin): void
    {
        $user = User::firstOrCreate(
            ['email' => 'city.diagnostics@bloodathome.com'],
            [
                'first_name' => 'City',
                'last_name' => 'Diagnostics',
                'date_of_birth' => '1978-03-15',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (! $user->hasRole('provider')) {
            $user->assignRole('provider');
        }

        $activeStatus = ProviderStatus::where('name', 'Active')->first();
        $labType = ProviderType::where('name', 'Laboratory')->first();

        $provider = Provider::firstOrCreate(
            ['user_id' => $user->id],
            [
                'type_id' => $labType->id,
                'status_id' => $activeStatus->id,
                'provider_name' => 'City Diagnostics Laboratory',
                'address_line1' => '150 Bishopsgate',
                'town_city' => 'London',
                'postcode' => 'EC2M 4LN',
                'latitude' => 51.5155,
                'longitude' => -0.0922,
                'bio' => 'Leading diagnostic laboratory in the City of London. Full range of blood tests with same-day results available. Corporate accounts welcome.',
                'experience_years' => null,
                'average_rating' => 4.5,
                'total_reviews' => 156,
                'show_image_in_search' => true,
                'approved_at' => now(),
                'approved_by' => $admin->id,
            ]
        );

        $this->createProviderServices($provider, [
            ['code' => 'BT_FBC', 'price' => 32.00],
            ['code' => 'BT_LFT', 'price' => 43.00],
            ['code' => 'BT_KFT', 'price' => 43.00],
            ['code' => 'BT_TFT', 'price' => 53.00],
            ['code' => 'BT_LIPID', 'price' => 38.00],
            ['code' => 'BT_HBA1C', 'price' => 33.00],
            ['code' => 'BT_VITD', 'price' => 33.00],
            ['code' => 'BT_VITB12', 'price' => 33.00],
            ['code' => 'BT_IRON', 'price' => 38.00],
            ['code' => 'BT_FULL', 'price' => 82.00],
            ['code' => 'BT_HORM_M', 'price' => 95.00],
            ['code' => 'BT_STI', 'price' => 75.00],
        ]);

        // Mon-Fri split with gap, shorter Saturday
        // Mon-Fri: 06:00-10:00, 12:00-16:00
        // Sat: 08:00-12:00
        $this->createProviderAvailability($provider, [
            ['day' => 1, 'start' => '06:00', 'end' => '10:00'],
            ['day' => 1, 'start' => '12:00', 'end' => '16:00'],
            ['day' => 2, 'start' => '06:00', 'end' => '10:00'],
            ['day' => 2, 'start' => '12:00', 'end' => '16:00'],
            ['day' => 3, 'start' => '06:00', 'end' => '10:00'],
            ['day' => 3, 'start' => '12:00', 'end' => '16:00'],
            ['day' => 4, 'start' => '06:00', 'end' => '10:00'],
            ['day' => 4, 'start' => '12:00', 'end' => '16:00'],
            ['day' => 5, 'start' => '06:00', 'end' => '10:00'],
            ['day' => 5, 'start' => '12:00', 'end' => '16:00'],
            ['day' => 6, 'start' => '08:00', 'end' => '12:00'],
        ]);

        $this->createProviderServiceAreas($provider, ['EC1', 'EC2', 'EC3', 'EC4', 'E1', 'E2']);
    }

    private function createProviderServices(Provider $provider, array $services): void
    {
        $activeStatus = ServiceActiveStatus::where('name', 'Active')->first();

        foreach ($services as $serviceData) {
            $service = Service::where('service_code', $serviceData['code'])->first();
            if ($service) {
                ProviderService::firstOrCreate(
                    [
                        'provider_id' => $provider->id,
                        'service_id' => $service->id,
                    ],
                    [
                        'base_cost' => $serviceData['price'],
                        'agreed_commission_percent' => 15.00,
                        'start_date' => now()->subMonths(6),
                        'end_date' => null,
                        'status_id' => $activeStatus->id,
                    ]
                );
            }
        }
    }

    private function createProviderAvailability(Provider $provider, array $schedule): void
    {
        foreach ($schedule as $slot) {
            ProviderAvailability::firstOrCreate(
                [
                    'provider_id' => $provider->id,
                    'day_of_week' => $slot['day'],
                    'start_time' => $slot['start'],
                    'end_time' => $slot['end'],
                ],
                [
                    'specific_date' => null,
                    'is_available' => true,
                ]
            );
        }
    }

    private function createProviderServiceAreas(Provider $provider, array $postcodes): void
    {
        foreach ($postcodes as $postcode) {
            ProviderServiceArea::firstOrCreate(
                [
                    'provider_id' => $provider->id,
                    'postcode_prefix' => $postcode,
                ],
                [
                    'max_distance_miles' => 5.0,
                    'additional_travel_fee' => 0.00,
                ]
            );
        }
    }
}
