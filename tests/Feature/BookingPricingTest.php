<?php

use App\Models\Booking;
use App\Models\SystemSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

it('calculates pricing with default rates (5% service fee, 20% VAT)', function () {
    // subtotal = 100
    // service_fee = 100 * 5/100 = 5.00
    // vat = (100 + 5) * 20/100 = 21.00
    // grand_total = 100 + 5 + 21 - 0 = 126.00
    $result = Booking::calculatePricing(100.0);

    expect($result)->toBe([
        'subtotal_amount' => 100.0,
        'service_fee_percent' => 5.0,
        'service_fee_amount' => 5.0,
        'vat_percent' => 20.0,
        'vat_amount' => 21.0,
        'discount_amount' => 0.0,
        'grand_total_cost' => 126.0,
    ]);
});

it('calculates pricing with custom rates stored in SystemSetting', function () {
    SystemSetting::create([
        'key' => 'platform.service_fee_percentage',
        'value' => '10',
        'type' => 'float',
    ]);

    SystemSetting::create([
        'key' => 'platform.vat_percentage',
        'value' => '15',
        'type' => 'float',
    ]);

    // subtotal = 200
    // service_fee = 200 * 10/100 = 20.00
    // vat = (200 + 20) * 15/100 = 33.00
    // grand_total = 200 + 20 + 33 - 0 = 253.00
    $result = Booking::calculatePricing(200.0);

    expect($result['service_fee_percent'])->toBe(10.0);
    expect($result['service_fee_amount'])->toBe(20.0);
    expect($result['vat_percent'])->toBe(15.0);
    expect($result['vat_amount'])->toBe(33.0);
    expect($result['grand_total_cost'])->toBe(253.0);
});

it('handles discount correctly', function () {
    // subtotal = 100
    // service_fee = 100 * 5/100 = 5.00
    // vat = (100 + 5) * 20/100 = 21.00
    // grand_total = 100 + 5 + 21 - 10 = 116.00
    $result = Booking::calculatePricing(100.0, 10.0);

    expect($result['discount_amount'])->toBe(10.0);
    expect($result['grand_total_cost'])->toBe(116.0);
});

it('handles zero subtotal', function () {
    $result = Booking::calculatePricing(0.0);

    expect($result)->toBe([
        'subtotal_amount' => 0.0,
        'service_fee_percent' => 5.0,
        'service_fee_amount' => 0.0,
        'vat_percent' => 20.0,
        'vat_amount' => 0.0,
        'discount_amount' => 0.0,
        'grand_total_cost' => 0.0,
    ]);
});
