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
        Schema::create('provider_services', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('provider_id')->constrained('providers')->cascadeOnDelete();
            $table->foreignUlid('service_id')->constrained('services')->cascadeOnDelete();
            $table->decimal('base_cost', 10, 2);
            $table->decimal('agreed_commission_percent', 5, 2);
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->foreignId('status_id')->constrained('service_active_statuses');
            $table->timestamps();

            // Indexes
            $table->index('start_date');
            $table->index('end_date');

            // Unique constraint
            $table->unique(['provider_id', 'service_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('provider_services');
    }
};
