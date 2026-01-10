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
        Schema::create('providers', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->foreignId('type_id')->constrained('provider_types');
            $table->foreignId('status_id')->constrained('provider_statuses');
            $table->string('provider_name', 255)->nullable();
            $table->string('address_line1', 255);
            $table->string('address_line2', 255)->nullable();
            $table->string('town_city', 100);
            $table->string('postcode', 10);
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 10, 8)->nullable();
            $table->geometry('location', 'point')->nullable();
            $table->string('profile_thumbnail_url', 255)->nullable();
            $table->text('bio')->nullable();
            $table->integer('experience_years')->nullable();
            $table->decimal('average_rating', 3, 2)->default(0);
            $table->integer('total_reviews')->default(0);
            $table->text('provider_notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('postcode');
            // Note: Spatial index for 'location' requires NOT NULL, so we'll handle it separately if needed
            $table->index('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('providers');
    }
};
