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
        Schema::create('staff', function (Blueprint $table) {
            $table->bigIncrements('staff_id');
            $table->string('staff_name', 255)->nullable();
            $table->string('email', 255)->nullable();
            $table->string('contact_no', 20)->nullable();
            $table->string('role', 50)->nullable();
            $table->string('color', 50)->nullable();
            $table->enum('status', ['active', 'inactive', 'on_duty'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff');
    }
};
