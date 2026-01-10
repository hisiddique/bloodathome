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
        Schema::create('user_payment_methods', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('stripe_payment_method_id', 255)->unique();
            $table->string('stripe_customer_id', 255);
            $table->string('card_brand', 50);
            $table->string('card_last_four', 4);
            $table->integer('card_exp_month');
            $table->integer('card_exp_year');
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            // Indexes
            $table->index('stripe_payment_method_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_payment_methods');
    }
};
