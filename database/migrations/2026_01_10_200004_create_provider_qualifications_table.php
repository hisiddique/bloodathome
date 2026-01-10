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
        Schema::create('provider_qualifications', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('provider_id')->constrained('providers')->cascadeOnDelete();
            $table->string('credential_name', 255);
            $table->string('issuing_body', 255);
            $table->string('license_number', 100)->nullable();
            $table->date('expiry_date')->nullable();
            $table->foreignId('status_id')->constrained('verification_statuses');
            $table->string('document_url', 255)->nullable();
            $table->string('verified_by_agent', 255)->nullable();
            $table->timestamps();

            // Indexes
            $table->index('expiry_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('provider_qualifications');
    }
};
