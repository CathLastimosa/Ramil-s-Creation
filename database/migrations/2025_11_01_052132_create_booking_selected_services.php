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
        Schema::create('booking_selected_services', function (Blueprint $table) {
            $table->bigIncrements('booking_selected_service_id');
            $table->unsignedBigInteger('booking_id')->nullable();
            $table->string('services_id', 255)->nullable();
            $table->string('package_id', 255)->nullable();
            $table->timestamps();
            $table->foreign('booking_id')->references('booking_id')->on('event_bookings')->onDelete('cascade');
            $table->foreign('services_id')->references('services_id')->on('services')->onDelete('cascade');
            $table->foreign('package_id')->references('package_id')->on('packages')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_selected_services');
    }
};
