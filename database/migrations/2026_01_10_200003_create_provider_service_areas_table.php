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
        Schema::create('provider_service_areas', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('provider_id')->constrained('providers')->cascadeOnDelete();
            $table->string('postcode_prefix', 4);
            $table->decimal('max_distance_miles', 5, 2);
            $table->decimal('additional_travel_fee', 10, 2);
            $table->timestamps();

            // Indexes
            $table->index('postcode_prefix');

            // Unique constraint
            $table->unique(['provider_id', 'postcode_prefix']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('provider_service_areas');
    }
};
