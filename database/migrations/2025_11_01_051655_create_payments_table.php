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
        Schema::create('payments', function (Blueprint $table) {
            $table->bigIncrements('payment_id');
            $table->unsignedBigInteger('booking_id');
            $table->enum('payment_method', ['gcash', 'cash on hand'])->nullable();
            $table->decimal('amount', 10, 2)->nullable();
            $table->enum('status', ['pending', 'paid'])->default('pending');
            $table->string('payment_proof', 255)->nullable();
            $table->string('reference_No', 255)->nullable();
            $table->timestamps(); 

            $table->foreign('booking_id')
                  ->references('booking_id')
                  ->on('event_bookings')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
