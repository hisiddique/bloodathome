<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->foreignUlid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUlid('provider_id')->constrained('providers')->cascadeOnDelete();
            $table->integer('rating');
            $table->text('review_text')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamps();

            // Indexes
            $table->index('user_id');
            $table->index('provider_id');
            $table->index('is_published');
            $table->index('created_at');

            // Unique constraint
            $table->unique('booking_id');
        });

        // Add check constraint for rating (1-5) - SQLite compatible
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement('ALTER TABLE reviews ADD CONSTRAINT reviews_rating_check CHECK (rating >= 1 AND rating <= 5)');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
