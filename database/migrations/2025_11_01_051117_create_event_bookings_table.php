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
        Schema::create('event_bookings', function (Blueprint $table) {
            $table->bigIncrements('booking_id');
            $table->string('transaction_number', 255)->nullable();
            $table->string('event_name', 255)->nullable();
            $table->date('event_date')->nullable();
            $table->time('event_time_from')->nullable();
            $table->time('event_time_to')->nullable();
            $table->string('event_type', 255)->nullable();
            $table->enum('status', ['pending', 'confirmed', 'completed','cancelled'])->default('pending');
            $table->boolean('email_verified')->default(0);
            $table->timestamp('email_verified_at')->nullable();
            $table->text('decline_reason')->nullable();
            $table->integer('guest_count')->nullable();
            $table->text('special_request')->nullable();
            $table->decimal('total_amount', 10, 2)->nullable();
            $table->string('contact_name', 255)->nullable();
            $table->string('contact_number', 255)->nullable();
            $table->string('contact_email', 255)->nullable();
            $table->string('barangay', 255)->nullable();
            $table->string('street_address', 255)->nullable();
            $table->string('city', 255)->nullable();
            $table->string('province', 255)->nullable();
            $table->timestamps();
            $table->softDeletes(); // for soft delete

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_bookings');
    }
};
