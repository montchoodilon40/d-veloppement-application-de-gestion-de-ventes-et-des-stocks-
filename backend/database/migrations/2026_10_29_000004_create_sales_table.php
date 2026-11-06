<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('client_id')->constrained()->restrictOnDelete();
            $table->dateTime('sale_date');
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('tax_rate', 5, 2)->default(0);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->string('payment_method', 30)->default('cash');
            $table->string('status', 20)->default('completed');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['sale_date', 'status']);
            $table->index('client_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
