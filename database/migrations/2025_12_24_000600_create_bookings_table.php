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
            $table->uuid('id')->primary();
            $table->foreignId('patient_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('phlebotomist_id')->constrained('phlebotomists');
            $table->string('phlebotomist_name');
            $table->string('phlebotomist_image')->nullable();
            $table->foreignUuid('blood_test_id')->nullable()->constrained('blood_tests');
            $table->date('appointment_date');
            $table->string('time_slot');
            $table->text('address');
            $table->string('postcode')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->enum('visit_type', ['home', 'clinic'])->default('home');
            $table->enum('status', ['pending', 'confirmed', 'completed', 'cancelled'])->default('pending');
            $table->decimal('price', 8, 2);
            $table->json('patient_details')->nullable();
            $table->timestamps();
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
