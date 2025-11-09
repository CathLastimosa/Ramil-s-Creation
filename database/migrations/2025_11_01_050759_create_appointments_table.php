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
        Schema::create('appointments', function (Blueprint $table) {
            $table->id('appointment_id'); // primary key
            $table->string('contact_name');
            $table->string('contact_email');
            $table->string('contact_phone');
            $table->string('purpose')->nullable();
            $table->date('appointment_date');
            $table->time('appointment_time_from');
            $table->time('appointment_time_to')->nullable();
            $table->enum('status', ['reserved', 'completed'])->default('reserved');
            $table->timestamps();
            $table->softDeletes(); // for soft delete
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
