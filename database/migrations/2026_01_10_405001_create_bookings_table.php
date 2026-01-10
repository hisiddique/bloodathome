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
        Schema::create('bookings', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained('users')->restrictOnDelete();
            $table->foreignUlid('provider_id')->constrained('providers')->restrictOnDelete();
            $table->foreignId('status_id')->constrained('booking_statuses');
            $table->string('confirmation_number', 50)->unique();
            $table->foreignId('collection_type_id')->constrained('collection_types');
            $table->string('nhs_number', 20)->nullable();
            $table->date('scheduled_date');
            $table->string('time_slot', 20);
            $table->string('service_address_line1', 255);
            $table->string('service_address_line2', 255)->nullable();
            $table->string('service_town_city', 100);
            $table->string('service_postcode', 10);
            $table->decimal('grand_total_cost', 10, 2);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->foreignUlid('promo_code_id')->nullable()->constrained('promo_codes');
            $table->string('stripe_payment_intent_id', 255)->nullable()->unique();
            $table->text('visit_instructions')->nullable();
            $table->text('patient_notes')->nullable();
            $table->string('guardian_name', 255)->nullable();
            $table->boolean('guardian_confirmed')->default(false);
            $table->string('draft_token', 255)->nullable();
            $table->timestamp('draft_expires_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();

            // Indexes
            $table->index('confirmation_number');
            $table->index('scheduled_date');
            $table->index('stripe_payment_intent_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
