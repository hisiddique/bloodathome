<?php

use Tests\Browser\BookingE2eSetup;

uses(BookingE2eSetup::class);

beforeEach(function () {
    $this->disableViteHmr();
    $this->seedBookingData();
});

it('back navigation preserves selections at collection step', function () {
    $page = visit('/book');

    // Select collection type and services
    $page->waitForText('Choose Your Test')
        ->click('Home Visit')
        ->waitForText('Full Blood Count')
        ->click('[aria-label="Full Blood Count (FBC)"]')
        ->press('Continue to Location');

    // At location step, go back
    $page->waitForText('Location')
        ->click('Back to Choose Your Test');

    // Service selection should be preserved
    $page->waitForText('Choose Your Test')
        ->assertSee('1 selected');
});

it('continue button requires collection type and service', function () {
    $page = visit('/book');

    $page->waitForText('Choose Your Test')
        ->assertDisabled('Continue to Location');

    // Collection type alone is not enough
    $page->click('Home Visit')
        ->assertDisabled('Continue to Location');

    // Adding a service enables it
    $page->waitForText('Full Blood Count')
        ->click('[aria-label="Full Blood Count (FBC)"]')
        ->assertEnabled('Continue to Location');
});

it('expired draft resets to collection step', function () {
    $page = visit('/book');

    // Inject an expired draft state
    $page->script("
        const state = {
            step: 'provider',
            collectionType: 'home_visit',
            selectedServices: [],
            _savedAt: Date.now() - (2 * 60 * 60 * 1000)
        };
        localStorage.setItem('bloodathome_booking_draft', JSON.stringify(state));
    ");

    // Revisit in same context — should reset to collection
    $page->navigate('/book');

    $page->waitForText('Choose Your Test');
});

it('booking state persists across page refresh', function () {
    $page = visit('/book');

    $page->waitForText('Choose Your Test')
        ->click('Home Visit')
        ->waitForText('Full Blood Count')
        ->click('[aria-label="Full Blood Count (FBC)"]')
        ->assertSee('1 selected');

    // Wait for localStorage save
    $page->wait(0.5);

    // Refresh in same context
    $page->refresh();

    // Selection should be restored
    $page->waitForText('Choose Your Test')
        ->assertSee('1 selected');
});

it('collection type selection toggles correctly', function () {
    $page = visit('/book');

    $page->waitForText('Choose Your Test')
        ->click('Home Visit')
        ->assertSee('Professional visits your location');

    $page->click('Clinic Visit')
        ->assertSee('Visit a clinic location');
});

it('NHS test toggle works on collection step', function () {
    $page = visit('/book');

    $page->waitForText('Choose Your Test')
        ->click('Home Visit')
        ->check('#nhs-test')
        ->assertChecked('#nhs-test');
});
