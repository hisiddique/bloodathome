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
        Schema::create('provider_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignUlid('provider_id')->constrained('providers')->cascadeOnDelete();
            $table->decimal('commission_percentage', 5, 2);
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->timestamp('created_at');

            // Indexes
            $table->index('start_date');
            $table->index('end_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('provider_rates');
    }
};
