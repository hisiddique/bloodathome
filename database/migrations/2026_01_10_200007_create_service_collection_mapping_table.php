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
        Schema::create('service_collection_mapping', function (Blueprint $table) {
            $table->id();
            $table->foreignUlid('service_id')->constrained('services')->cascadeOnDelete();
            $table->foreignId('collection_type_id')->constrained('collection_types')->cascadeOnDelete();
            $table->decimal('additional_cost', 10, 2)->default(0);
            $table->text('description_html')->nullable();
            $table->timestamp('created_at');

            // Unique constraint
            $table->unique(['service_id', 'collection_type_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_collection_mapping');
    }
};
