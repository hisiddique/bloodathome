<?php

use Tests\Browser\BookingE2eSetup;

uses(BookingE2eSetup::class);

beforeEach(function () {
    $this->disableViteHmr();
    $this->seedBookingData();
});

it('auth user completes full booking with saved address', function () {
    $patient = $this->createPatientWithAddress();
    $nextWeekday = $this->getNextWeekday();

    // Log in
    $page = visit('/book');
    $page->waitForText('Choose Your Test');
    $page->navigate('/login');
    $page->wait(1);
    $page->fill('#email', 'patient@bloodathome.com')
        ->fill('#password', 'password')
        ->click('button[type="submit"]');

    $page->waitForText('Dashboard');
    $page->wait(0.5);
    $page->navigate('/book');

    // Step 1: Collection
    $page->waitForText('Choose Your Test')
        ->click('Home Visit')
        ->waitForText('Full Blood Count')
        ->click('[aria-label="Full Blood Count (FBC)"]')
        ->press('Continue to Location');

    // Step 2: Location — use saved address
    $page->waitForText('Location')
        ->click('10 Downing Street');

    $page->click('Pick a date')
        ->click((string) $nextWeekday->day)
        ->press('Find Providers');

    // Step 3: Provider
    $page->waitForText('Select Provider')
        ->waitForText('Sarah Johnson')
        ->click('Sarah Johnson')
        ->waitForText('Select Time Slot');

    $page->script("document.querySelector('.grid button:not([disabled])').click()");

    $page->wait(0.5);
    $page->press('Continue to Patient Details');

    // Step 4: Patient — no auth gate for logged-in user
    $page->waitForText('Patient Details')
        ->press('Continue to Payment');

    // Step 5: Payment — wait for Stripe form and draft to be created
    $page->waitForText('Payment')
        ->waitForText('Pay £');

    // Wait for draft and payment intent to be created
    $page->wait(3);

    // Confirm payment server-side (bypasses Stripe iframe networkidle hang)
    $this->confirmPaymentServerSide($page);

    // Step 6: Success
    $page->navigate('/book');
    $page->waitForText('Booking Confirmed!');
});

it('auth user sees saved and new address tabs', function () {
    $this->createPatientWithAddress();

    $page = visit('/book');
    $page->waitForText('Choose Your Test');
    $page->navigate('/login');
    $page->wait(1);
    $page->fill('#email', 'patient@bloodathome.com')
        ->fill('#password', 'password')
        ->click('button[type="submit"]');

    $page->waitForText('Dashboard');
    $page->wait(0.5);
    $page->navigate('/book');

    $page->waitForText('Choose Your Test')
        ->click('Home Visit')
        ->waitForText('Full Blood Count')
        ->click('[aria-label="Full Blood Count (FBC)"]')
        ->press('Continue to Location');

    $page->waitForText('Location')
        ->assertSee('Saved Addresses')
        ->assertSee('New Address');
});

it('auth user patient step bypasses auth gate', function () {
    $this->createPatientWithAddress();
    $nextWeekday = $this->getNextWeekday();

    $page = visit('/book');
    $page->waitForText('Choose Your Test');
    $page->navigate('/login');
    $page->wait(1);
    $page->fill('#email', 'patient@bloodathome.com')
        ->fill('#password', 'password')
        ->click('button[type="submit"]');

    $page->waitForText('Dashboard');
    $page->wait(0.5);
    $page->navigate('/book');

    $page->waitForText('Choose Your Test')
        ->click('Home Visit')
        ->waitForText('Full Blood Count')
        ->click('[aria-label="Full Blood Count (FBC)"]')
        ->press('Continue to Location');

    $page->waitForText('Location')
        ->script("
            const state = JSON.parse(localStorage.getItem('bloodathome_booking_draft') || '{}');
            state.location = {
                postcode: 'SW1A 2AA',
                address: '10 Downing Street, London, SW1A 2AA',
                lat: 51.5034, lng: -0.1276,
                addressLine1: '10 Downing Street', addressLine2: '', townCity: 'London'
            };
            localStorage.setItem('bloodathome_booking_draft', JSON.stringify(state));
        ");

    $page->navigate('/book');

    $page->waitForText('Location')
        ->click('Pick a date')
        ->click((string) $nextWeekday->day)
        ->press('Find Providers');

    $page->waitForText('Select Provider')
        ->waitForText('Sarah Johnson')
        ->click('Sarah Johnson')
        ->waitForText('Select Time Slot');

    $page->script("document.querySelector('.grid button:not([disabled])').click()");

    $page->wait(0.5);
    $page->press('Continue to Patient Details');

    // Auth user goes directly to patient info — no auth gate
    $page->waitForText('Patient Details')
        ->assertDontSee('How would you like to continue?')
        ->assertSee('Myself');
});

it('auth user can select add new dependent', function () {
    $this->createPatientWithAddress();
    $nextWeekday = $this->getNextWeekday();

    $page = visit('/book');
    $page->waitForText('Choose Your Test');
    $page->navigate('/login');
    $page->wait(1);
    $page->fill('#email', 'patient@bloodathome.com')
        ->fill('#password', 'password')
        ->click('button[type="submit"]');

    $page->waitForText('Dashboard');
    $page->wait(0.5);
    $page->navigate('/book');

    $page->waitForText('Choose Your Test')
        ->click('Home Visit')
        ->waitForText('Full Blood Count')
        ->click('[aria-label="Full Blood Count (FBC)"]')
        ->press('Continue to Location');

    $page->waitForText('Location')
        ->script("
            const state = JSON.parse(localStorage.getItem('bloodathome_booking_draft') || '{}');
            state.location = {
                postcode: 'SW1A 2AA',
                address: '10 Downing Street, London, SW1A 2AA',
                lat: 51.5034, lng: -0.1276,
                addressLine1: '10 Downing Street', addressLine2: '', townCity: 'London'
            };
            localStorage.setItem('bloodathome_booking_draft', JSON.stringify(state));
        ");

    $page->navigate('/book');

    $page->waitForText('Location')
        ->click('Pick a date')
        ->click((string) $nextWeekday->day)
        ->press('Find Providers');

    $page->waitForText('Select Provider')
        ->waitForText('Sarah Johnson')
        ->click('Sarah Johnson')
        ->waitForText('Select Time Slot');

    $page->script("document.querySelector('.grid button:not([disabled])').click()");

    $page->wait(0.5);
    $page->press('Continue to Patient Details');

    // Click Add New dependent — form should appear
    $page->waitForText('Patient Details')
        ->click('Add New');

    $page->waitForText('Add New Dependent');
});

it('auth user NHS booking advances to location', function () {
    $this->createPatientWithAddress();

    $page = visit('/book');
    $page->waitForText('Choose Your Test');
    $page->navigate('/login');
    $page->wait(1);
    $page->fill('#email', 'patient@bloodathome.com')
        ->fill('#password', 'password')
        ->click('button[type="submit"]');

    $page->waitForText('Dashboard');
    $page->wait(0.5);
    $page->navigate('/book');

    $page->waitForText('Choose Your Test')
        ->click('Home Visit')
        ->check('#nhs-test')
        ->assertChecked('#nhs-test')
        ->waitForText('Full Blood Count')
        ->click('[aria-label="Full Blood Count (FBC)"]')
        ->press('Continue to Location');

    $page->waitForText('Location');
});

it('auth user reaches provider list', function () {
    $this->createPatientWithAddress();
    $nextWeekday = $this->getNextWeekday();

    $page = visit('/book');
    $page->waitForText('Choose Your Test');
    $page->navigate('/login');
    $page->wait(1);
    $page->fill('#email', 'patient@bloodathome.com')
        ->fill('#password', 'password')
        ->click('button[type="submit"]');

    $page->waitForText('Dashboard');
    $page->wait(0.5);
    $page->navigate('/book');

    $page->waitForText('Choose Your Test')
        ->click('Home Visit')
        ->waitForText('Full Blood Count')
        ->click('[aria-label="Full Blood Count (FBC)"]')
        ->press('Continue to Location');

    $page->waitForText('Location')
        ->script("
            const state = JSON.parse(localStorage.getItem('bloodathome_booking_draft') || '{}');
            state.location = {
                postcode: 'SW1A 2AA',
                address: '10 Downing Street, London, SW1A 2AA',
                lat: 51.5034, lng: -0.1276,
                addressLine1: '10 Downing Street', addressLine2: '', townCity: 'London'
            };
            localStorage.setItem('bloodathome_booking_draft', JSON.stringify(state));
        ");

    $page->navigate('/book');

    $page->waitForText('Location')
        ->click('Pick a date')
        ->click((string) $nextWeekday->day)
        ->press('Find Providers');

    $page->waitForText('Select Provider')
        ->assertSee('Sarah Johnson');
});

it('auth user reaches payment step with stripe form', function () {
    $this->createPatientWithAddress();
    $nextWeekday = $this->getNextWeekday();

    $page = visit('/book');
    $page->waitForText('Choose Your Test');
    $page->navigate('/login');
    $page->wait(1);
    $page->fill('#email', 'patient@bloodathome.com')
        ->fill('#password', 'password')
        ->click('button[type="submit"]');

    $page->waitForText('Dashboard');
    $page->wait(0.5);
    $page->navigate('/book');

    $page->waitForText('Choose Your Test')
        ->click('Home Visit')
        ->waitForText('Full Blood Count')
        ->click('[aria-label="Full Blood Count (FBC)"]')
        ->press('Continue to Location');

    $page->waitForText('Location')
        ->script("
            const state = JSON.parse(localStorage.getItem('bloodathome_booking_draft') || '{}');
            state.location = {
                postcode: 'SW1A 2AA',
                address: '10 Downing Street, London, SW1A 2AA',
                lat: 51.5034, lng: -0.1276,
                addressLine1: '10 Downing Street', addressLine2: '', townCity: 'London'
            };
            localStorage.setItem('bloodathome_booking_draft', JSON.stringify(state));
        ");

    $page->navigate('/book');

    $page->waitForText('Location')
        ->click('Pick a date')
        ->click((string) $nextWeekday->day)
        ->press('Find Providers');

    $page->waitForText('Select Provider')
        ->waitForText('Sarah Johnson')
        ->click('Sarah Johnson')
        ->waitForText('Select Time Slot');

    $page->script("document.querySelector('.grid button:not([disabled])').click()");

    $page->wait(0.5);
    $page->press('Continue to Patient Details');

    $page->waitForText('Patient Details')
        ->press('Continue to Payment');

    // Payment step loads with Stripe
    $page->waitForText('Payment')
        ->waitForText('Pay £');
});
