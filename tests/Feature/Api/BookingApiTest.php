<?php

namespace Tests\Feature\Api;

use App\Models\Booking;
use App\Models\BookingStatus;
use App\Models\CollectionType;
use App\Models\Provider;
use App\Models\ProviderService;
use App\Models\ProviderStatus;
use App\Models\ProviderType;
use App\Models\Service;
use App\Models\ServiceActiveStatus;
use App\Models\ServiceCategory;
use App\Models\ServiceCollectionMapping;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_fetch_services_with_correct_format()
    {
        $category = ServiceCategory::factory()->create([
            'name' => 'Blood Test',
        ]);

        $service = Service::factory()->create([
            'service_category_id' => $category->id,
            'service_name' => 'Full Blood Count',
            'service_code' => 'FBC',
            'service_description' => 'Complete blood cell analysis',
            'is_active' => true,
        ]);

        $collectionType = CollectionType::firstOrCreate(
            ['name' => 'Home Visit'],
            ['icon_class' => 'fas fa-home', 'display_order' => 1]
        );

        ServiceCollectionMapping::create([
            'service_id' => $service->id,
            'collection_type_id' => $collectionType->id,
            'additional_cost' => 0.00,
            'created_at' => now(),
        ]);

        $response = $this->getJson('/api/services');

        $response->assertSuccessful()
            ->assertJsonStructure([
                'services' => [
                    '*' => [
                        'id',
                        'service_name',
                        'service_code',
                        'service_description',
                        'category' => [
                            'id',
                            'name',
                        ],
                        'is_active',
                    ],
                ],
            ])
            ->assertJsonFragment([
                'service_name' => 'Full Blood Count',
                'service_code' => 'FBC',
            ]);
    }

    public function test_can_filter_services_by_collection_type()
    {
        $category = ServiceCategory::factory()->create(['name' => 'Blood Test']);

        $service1 = Service::factory()->create([
            'service_category_id' => $category->id,
            'service_name' => 'Service 1',
            'is_active' => true,
        ]);

        $service2 = Service::factory()->create([
            'service_category_id' => $category->id,
            'service_name' => 'Service 2',
            'is_active' => true,
        ]);

        $homeVisit = CollectionType::firstOrCreate(
            ['name' => 'Home Visit'],
            ['icon_class' => 'fas fa-home', 'display_order' => 1]
        );

        $clinic = CollectionType::firstOrCreate(
            ['name' => 'Clinic'],
            ['icon_class' => 'fas fa-hospital', 'display_order' => 2]
        );

        ServiceCollectionMapping::create([
            'service_id' => $service1->id,
            'collection_type_id' => $homeVisit->id,
            'additional_cost' => 0.00,
            'created_at' => now(),
        ]);

        ServiceCollectionMapping::create([
            'service_id' => $service2->id,
            'collection_type_id' => $clinic->id,
            'additional_cost' => 0.00,
            'created_at' => now(),
        ]);

        $response = $this->getJson('/api/services?collection_type=Home Visit');

        $response->assertSuccessful()
            ->assertJsonCount(1, 'services')
            ->assertJsonFragment(['service_name' => 'Service 1'])
            ->assertJsonMissing(['service_name' => 'Service 2']);
    }

    public function test_can_fetch_collection_types()
    {
        CollectionType::firstOrCreate(
            ['name' => 'Home Visit'],
            ['icon_class' => 'fas fa-home', 'display_order' => 1, 'description' => 'Home service']
        );

        CollectionType::firstOrCreate(
            ['name' => 'Clinic'],
            ['icon_class' => 'fas fa-hospital', 'display_order' => 2, 'description' => 'Clinic service']
        );

        $response = $this->getJson('/api/collection-types');

        $response->assertSuccessful()
            ->assertJsonStructure([
                'collectionTypes' => [
                    '*' => [
                        'id',
                        'name',
                        'icon_class',
                        'description',
                        'display_order',
                    ],
                ],
            ])
            ->assertJsonCount(2, 'collectionTypes');
    }

    public function test_can_create_booking_draft_with_frontend_payload()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        BookingStatus::firstOrCreate(['name' => 'Pending'], ['display_order' => 1]);

        $providerStatus = ProviderStatus::firstOrCreate(['name' => 'Active'], ['display_order' => 1]);
        $providerType = ProviderType::firstOrCreate(['name' => 'Phlebotomist'], ['display_order' => 1]);

        $provider = Provider::factory()->create([
            'status_id' => $providerStatus->id,
            'type_id' => $providerType->id,
        ]);

        $homeVisit = CollectionType::firstOrCreate(
            ['name' => 'Home Visit'],
            ['icon_class' => 'fas fa-home', 'display_order' => 1]
        );

        $category = ServiceCategory::factory()->create(['name' => 'Blood Test']);
        $service = Service::factory()->create([
            'service_category_id' => $category->id,
            'is_active' => true,
        ]);

        $serviceActiveStatus = ServiceActiveStatus::firstOrCreate(['name' => 'Active']);

        ProviderService::create([
            'provider_id' => $provider->id,
            'service_id' => $service->id,
            'base_cost' => 50.00,
            'agreed_commission_percent' => 10,
            'status_id' => $serviceActiveStatus->id,
            'start_date' => now(),
        ]);

        $payload = [
            'collection_type' => 'Home Visit',
            'is_nhs_test' => false,
            'service_ids' => [$service->id],
            'location' => [
                'postcode' => 'SW1A 1AA',
                'address' => '10 Downing Street',
                'city' => 'London',
            ],
            'selected_date' => now()->addDays(2)->format('Y-m-d'),
            'time_of_day' => 'morning',
            'provider_id' => $provider->id,
            'patient_details' => [
                'nhs_number' => '1234567890',
                'notes' => 'Please ring doorbell',
            ],
        ];

        $response = $this->postJson('/api/booking-drafts', $payload);

        $response->assertSuccessful()
            ->assertJsonStructure([
                'success',
                'data' => [
                    'booking_id',
                    'draft_token',
                    'expires_at',
                    'total_cost',
                ],
            ]);

        $this->assertDatabaseHas('bookings', [
            'user_id' => $user->id,
            'provider_id' => $provider->id,
            'service_postcode' => 'SW1A 1AA',
            'collection_type_id' => $homeVisit->id,
        ]);
    }

    public function test_can_update_booking_draft()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $pendingStatus = BookingStatus::firstOrCreate(['name' => 'Pending'], ['display_order' => 1]);
        $providerStatus = ProviderStatus::firstOrCreate(['name' => 'Active'], ['display_order' => 1]);
        $providerType = ProviderType::firstOrCreate(['name' => 'Phlebotomist'], ['display_order' => 1]);

        $provider = Provider::factory()->create([
            'status_id' => $providerStatus->id,
            'type_id' => $providerType->id,
        ]);

        $homeVisit = CollectionType::firstOrCreate(
            ['name' => 'Home Visit'],
            ['icon_class' => 'fas fa-home', 'display_order' => 1]
        );

        $category = ServiceCategory::factory()->create(['name' => 'Blood Test']);
        $service = Service::factory()->create([
            'service_category_id' => $category->id,
            'is_active' => true,
        ]);

        $serviceActiveStatus = ServiceActiveStatus::firstOrCreate(['name' => 'Active']);

        ProviderService::create([
            'provider_id' => $provider->id,
            'service_id' => $service->id,
            'base_cost' => 50.00,
            'agreed_commission_percent' => 10,
            'status_id' => $serviceActiveStatus->id,
            'start_date' => now(),
        ]);

        $booking = Booking::factory()->create([
            'user_id' => $user->id,
            'provider_id' => $provider->id,
            'status_id' => $pendingStatus->id,
            'collection_type_id' => $homeVisit->id,
            'scheduled_date' => now()->addDays(2),
            'time_slot' => '09:00',
            'service_postcode' => 'SW1A 1AA',
            'grand_total_cost' => 50.00,
            'draft_expires_at' => now()->addMinutes(30),
        ]);

        $payload = [
            'collection_type' => 'Home Visit',
            'service_ids' => [$service->id],
            'location' => [
                'postcode' => 'E1 6AN',
                'address' => 'Updated Address',
                'city' => 'London',
            ],
            'selected_date' => now()->addDays(3)->format('Y-m-d'),
            'time_of_day' => 'afternoon',
            'provider_id' => $provider->id,
        ];

        $response = $this->patchJson("/api/booking-drafts/{$booking->id}", $payload);

        $response->assertSuccessful();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'service_postcode' => 'E1 6AN',
            'time_slot' => '13:00',
        ]);
    }

    public function test_cannot_update_booking_draft_from_different_user()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $this->actingAs($user2);

        $pendingStatus = BookingStatus::firstOrCreate(['name' => 'Pending'], ['display_order' => 1]);
        $providerStatus = ProviderStatus::firstOrCreate(['name' => 'Active'], ['display_order' => 1]);
        $providerType = ProviderType::firstOrCreate(['name' => 'Phlebotomist'], ['display_order' => 1]);

        $provider = Provider::factory()->create([
            'status_id' => $providerStatus->id,
            'type_id' => $providerType->id,
        ]);

        $homeVisit = CollectionType::firstOrCreate(
            ['name' => 'Home Visit'],
            ['icon_class' => 'fas fa-home', 'display_order' => 1]
        );

        $booking = Booking::factory()->create([
            'user_id' => $user1->id,
            'provider_id' => $provider->id,
            'status_id' => $pendingStatus->id,
            'collection_type_id' => $homeVisit->id,
            'scheduled_date' => now()->addDays(2),
            'draft_expires_at' => now()->addMinutes(30),
        ]);

        $category = ServiceCategory::factory()->create(['name' => 'Blood Test']);
        $service = Service::factory()->create([
            'service_category_id' => $category->id,
            'is_active' => true,
        ]);

        $payload = [
            'collection_type' => 'Home Visit',
            'service_ids' => [$service->id],
            'location' => ['postcode' => 'E1 6AN', 'address' => 'Test'],
            'selected_date' => now()->addDays(3)->format('Y-m-d'),
            'time_of_day' => 'afternoon',
            'provider_id' => $provider->id,
        ];

        $response = $this->patchJson("/api/booking-drafts/{$booking->id}", $payload);

        $response->assertForbidden();
    }

    public function test_can_create_booking_draft_with_lowercase_underscore_collection_type()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        BookingStatus::firstOrCreate(['name' => 'Pending'], ['display_order' => 1]);

        $providerStatus = ProviderStatus::firstOrCreate(['name' => 'Active'], ['display_order' => 1]);
        $providerType = ProviderType::firstOrCreate(['name' => 'Phlebotomist'], ['display_order' => 1]);

        $provider = Provider::factory()->create([
            'status_id' => $providerStatus->id,
            'type_id' => $providerType->id,
        ]);

        $homeVisit = CollectionType::firstOrCreate(
            ['name' => 'Home Visit'],
            ['icon_class' => 'fas fa-home', 'display_order' => 1]
        );

        $category = ServiceCategory::factory()->create(['name' => 'Blood Test']);
        $service = Service::factory()->create([
            'service_category_id' => $category->id,
            'is_active' => true,
        ]);

        $serviceActiveStatus = ServiceActiveStatus::firstOrCreate(['name' => 'Active']);

        ProviderService::create([
            'provider_id' => $provider->id,
            'service_id' => $service->id,
            'base_cost' => 50.00,
            'agreed_commission_percent' => 10,
            'status_id' => $serviceActiveStatus->id,
            'start_date' => now(),
        ]);

        $payload = [
            'collection_type' => 'home_visit',
            'is_nhs_test' => false,
            'service_ids' => [$service->id],
            'location' => [
                'postcode' => 'SW1A 1AA',
                'address' => '10 Downing Street',
                'city' => 'London',
            ],
            'selected_date' => now()->addDays(2)->format('Y-m-d'),
            'time_of_day' => 'morning',
            'provider_id' => $provider->id,
            'patient_details' => [
                'nhs_number' => '1234567890',
                'notes' => 'Please ring doorbell',
            ],
        ];

        $response = $this->postJson('/api/booking-drafts', $payload);

        $response->assertSuccessful()
            ->assertJsonStructure([
                'success',
                'data' => [
                    'booking_id',
                    'draft_token',
                    'expires_at',
                    'total_cost',
                ],
            ]);

        $this->assertDatabaseHas('bookings', [
            'user_id' => $user->id,
            'provider_id' => $provider->id,
            'service_postcode' => 'SW1A 1AA',
            'collection_type_id' => $homeVisit->id,
        ]);
    }

    public function test_can_create_booking_draft_for_clinic_with_lowercase()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        BookingStatus::firstOrCreate(['name' => 'Pending'], ['display_order' => 1]);

        $providerStatus = ProviderStatus::firstOrCreate(['name' => 'Active'], ['display_order' => 1]);
        $providerType = ProviderType::firstOrCreate(['name' => 'Clinic'], ['display_order' => 2]);

        $provider = Provider::factory()->create([
            'status_id' => $providerStatus->id,
            'type_id' => $providerType->id,
        ]);

        $clinic = CollectionType::firstOrCreate(
            ['name' => 'Clinic'],
            ['icon_class' => 'fas fa-hospital', 'display_order' => 2]
        );

        $category = ServiceCategory::factory()->create(['name' => 'Blood Test']);
        $service = Service::factory()->create([
            'service_category_id' => $category->id,
            'is_active' => true,
        ]);

        $serviceActiveStatus = ServiceActiveStatus::firstOrCreate(['name' => 'Active']);

        ProviderService::create([
            'provider_id' => $provider->id,
            'service_id' => $service->id,
            'base_cost' => 30.00,
            'agreed_commission_percent' => 10,
            'status_id' => $serviceActiveStatus->id,
            'start_date' => now(),
        ]);

        $payload = [
            'collection_type' => 'clinic',
            'service_ids' => [$service->id],
            'selected_date' => now()->addDays(2)->format('Y-m-d'),
            'time_of_day' => 'afternoon',
            'provider_id' => $provider->id,
        ];

        $response = $this->postJson('/api/booking-drafts', $payload);

        $response->assertSuccessful();

        $this->assertDatabaseHas('bookings', [
            'user_id' => $user->id,
            'provider_id' => $provider->id,
            'collection_type_id' => $clinic->id,
            'time_slot' => '13:00',
        ]);
    }
}
