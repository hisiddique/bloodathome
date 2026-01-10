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
        Schema::create('booking_consents', function (Blueprint $table) {
            $table->id();
            $table->foreignUlid('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->string('consent_type', 50);
            $table->text('consent_text');
            $table->timestamp('consented_at');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at');

            // Indexes
            $table->index('consent_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_consents');
    }
};
