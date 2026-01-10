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
        Schema::create('payment_tax_breakdown', function (Blueprint $table) {
            $table->id();
            $table->foreignUlid('payment_id')->constrained('payments')->cascadeOnDelete();
            $table->string('tax_type_name', 100);
            $table->decimal('tax_percentage', 5, 2);
            $table->decimal('tax_amount_calculated', 10, 2);
            $table->timestamp('created_at');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_tax_breakdown');
    }
};
