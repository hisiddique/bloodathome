<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->foreignId('method_id')->constrained('payment_methods');
            $table->decimal('amount', 10, 2);
            $table->string('transaction_ref', 100)->unique();
            $table->string('stripe_payment_intent_id', 255)->unique();
            $table->string('stripe_charge_id', 255)->nullable()->unique();
            $table->string('card_last_four', 4)->nullable();
            $table->string('card_brand', 50)->nullable();
            $table->foreignId('payment_status_id')->constrained('payment_statuses');
            $table->timestamp('payment_date');
            $table->timestamps();

            // Indexes
            $table->index('stripe_payment_intent_id');
            $table->index('payment_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
