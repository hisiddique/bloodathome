<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $methods = [
            [
                'name' => 'GPay',
                'description' => 'Google Pay payment method',
            ],
            [
                'name' => 'MasterCard',
                'description' => 'MasterCard credit/debit card',
            ],
            [
                'name' => 'CreditCard',
                'description' => 'Generic credit card payment',
            ],
            [
                'name' => 'BankPortal',
                'description' => 'Direct bank portal payment',
            ],
        ];

        foreach ($methods as $method) {
            PaymentMethod::firstOrCreate(
                ['name' => $method['name']],
                $method
            );
        }
    }
}
