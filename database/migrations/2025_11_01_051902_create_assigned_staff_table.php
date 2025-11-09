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
        Schema::create('assigned_staff', function (Blueprint $table) {
            $table->bigIncrements('assigned_id');
            $table->unsignedBigInteger('booking_id')->nullable();
            $table->unsignedBigInteger('service_booking_id')->nullable();
            $table->unsignedBigInteger('staff_id')->nullable();
            $table->string('assigned_role', 100)->nullable();
            $table->enum('booking_type', ['event', 'service'])->nullable();
            $table->timestamps();
            $table->foreign('booking_id')->references('booking_id')->on('event_bookings')->onDelete('cascade');
            $table->foreign('service_booking_id')->references('service_booking_id')->on('service_bookings')->onDelete('cascade');
            $table->foreign('staff_id')->references('staff_id')->on('staff')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assigned_staff');
    }
};
