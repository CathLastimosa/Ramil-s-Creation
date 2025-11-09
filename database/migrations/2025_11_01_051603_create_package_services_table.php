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
        Schema::create('package_services', function (Blueprint $table) {
            $table->bigIncrements('package_service_id');
            $table->string('package_id', 255);
            $table->string('services_id', 255);

            $table->foreign('package_id')
                  ->references('package_id')
                  ->on('packages')
                  ->onDelete('cascade');

            $table->foreign('services_id')
                  ->references('services_id')
                  ->on('services')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('package_services');
    }
};
