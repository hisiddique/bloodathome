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
        Schema::create('invoices', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('payment_id')->constrained('payments')->cascadeOnDelete();
            $table->string('invoice_number', 50)->unique();
            $table->text('billing_address');
            $table->decimal('subtotal_amount', 10, 2);
            $table->decimal('total_tax_amount', 10, 2);
            $table->decimal('grand_total', 10, 2);
            $table->string('pdf_storage_link', 255)->nullable();
            $table->timestamps();

            // Indexes
            $table->index('invoice_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
