<?php

use Tests\Browser\BookingE2eSetup;

uses(BookingE2eSetup::class);

beforeEach(function () {
    $this->disableViteHmr();
    $this->seedBookingData();
});

it('guest completes full home visit booking', function () {
    $nextWeekday = $this->getNextWeekday();

    $page = visit('/book');

    // Step 1: Collection
    $page->waitForText('Choose Your Test')
        ->click('Home Visit')
        ->waitForText('Full Blood Count')
        ->click('[aria-label="Full Blood Count (FBC)"]')
        ->press('Continue to Location');

    // Step 2: Location — inject address to bypass Google Maps
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

    // Step 3: Provider — select first provider and first available slot
    $page->waitForText('Select Provider')
        ->waitForText('Sarah Johnson')
        ->click('Sarah Johnson')
        ->waitForText('Select Time Slot');

    // Click first available time slot (colon in time breaks CSS selector parsing)
    $page->script("document.querySelector('.grid button:not([disabled])').click()");

    $page->wait(0.5);
    $page->press('Continue to Patient Details');

    // Step 4: Patient — guest auth gate
    $page->waitForText('How would you like to continue?')
        ->click('Continue as guest');

    $page->waitForText('Patient Details')
        ->fill('#first-name', 'Test')
        ->fill('#last-name', 'Guest')
        ->fill('#email', 'test.guest@example.com')
        ->fill('#phone', '07712345678')
        ->fill('#dob', '1990-05-15')
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

it('guest completes clinic visit booking to location step', function () {
    $page = visit('/book');

    $page->waitForText('Choose Your Test')
        ->click('Clinic Visit')
        ->waitForText('Full Blood Count')
        ->click('[aria-label="Full Blood Count (FBC)"]')
        ->press('Continue to Location');

    $page->waitForText('Location');
});

it('guest selects multiple services', function () {
    $page = visit('/book');

    $page->waitForText('Choose Your Test')
        ->click('Home Visit')
        ->waitForText('Full Blood Count')
        ->click('[aria-label="Full Blood Count (FBC)"]')
        ->click('[aria-label="Liver Function Test (LFT)"]')
        ->click('Vitamin D');
});

it('guest reaches auth gate at patient step', function () {
    $nextWeekday = $this->getNextWeekday();

    $page = visit('/book');

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

    // Guest should see auth gate
    $page->waitForText('How would you like to continue?');
});

it('guest form validation prevents advancing without required fields', function () {
    $page = visit('/book');

    // Continue button disabled without collection type + services
    $page->waitForText('Choose Your Test')
        ->assertDisabled('Continue to Location');

    $page->click('Home Visit')
        ->assertDisabled('Continue to Location');

    $page->waitForText('Full Blood Count')
        ->click('[aria-label="Full Blood Count (FBC)"]')
        ->assertEnabled('Continue to Location');
});

it('guest NHS booking advances to location step', function () {
    $page = visit('/book');

    $page->waitForText('Choose Your Test')
        ->click('Home Visit')
        ->check('#nhs-test')
        ->assertChecked('#nhs-test')
        ->waitForText('Full Blood Count')
        ->click('[aria-label="Full Blood Count (FBC)"]')
        ->press('Continue to Location');

    $page->waitForText('Location');
});

it('guest under-16 booking triggers guardian fields', function () {
    $nextWeekday = $this->getNextWeekday();

    $page = visit('/book');

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

    $page->waitForText('How would you like to continue?')
        ->click('Continue as guest');

    // Enter under-16 DOB
    $under16Dob = now()->subYears(12)->format('Y-m-d');

    $page->waitForText('Patient Details')
        ->fill('#first-name', 'Child')
        ->fill('#last-name', 'Test')
        ->fill('#email', 'parent@example.com')
        ->fill('#phone', '07712345678')
        ->fill('#dob', $under16Dob);

    // Guardian section should appear
    $page->waitForText('Guardian Information Required');
});

it('guest can search and filter services', function () {
    $page = visit('/book');

    $page->waitForText('Choose Your Test')
        ->click('Home Visit')
        ->waitForText('Full Blood Count');

    $page->fill('[placeholder="Search services..."]', 'vitamin')
        ->assertSee('Vitamin D')
        ->assertDontSee('Full Blood Count');
});
