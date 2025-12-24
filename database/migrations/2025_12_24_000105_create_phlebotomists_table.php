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
        Schema::create('phlebotomists', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->string('name');
            $table->string('image')->nullable();
            $table->decimal('rating', 3, 2)->default(0);
            $table->string('experience');
            $table->decimal('price', 8, 2);
            $table->boolean('available')->default(true);
            $table->text('bio')->nullable();
            $table->integer('reviews_count')->default(0);
            $table->json('specialties')->nullable();
            $table->string('service_area')->nullable();
            $table->string('phone')->nullable();
            $table->string('certifications')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('phlebotomists');
    }
};
