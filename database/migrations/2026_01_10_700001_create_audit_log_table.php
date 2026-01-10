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
        Schema::create('audit_log', function (Blueprint $table) {
            $table->id();
            $table->string('table_name', 100);
            $table->string('record_id', 255);
            $table->string('action_type', 20);
            $table->json('old_value')->nullable();
            $table->json('new_value')->nullable();
            $table->string('changed_by', 255)->nullable();
            $table->timestamp('changed_at');
            $table->timestamp('created_at');

            // Indexes
            $table->index('table_name');
            $table->index('record_id');
            $table->index('action_type');
            $table->index('changed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_log');
    }
};
