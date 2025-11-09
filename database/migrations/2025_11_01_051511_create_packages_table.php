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
        Schema::create('packages', function (Blueprint $table) {
            $table->string('package_id', 255)->primary();
            $table->string('package_name', 255)->nullable();
            $table->text('package_description')->nullable();
            $table->enum('status', ['published', 'unpublished'])->default('published');
            $table->integer('package_price')->default(0);
            $table->integer('package_promo')->default(0);
            $table->decimal('discounted_price', 10, 2)->default(0);
            $table->integer('services_count')->nullable();
            $table->timestamps(); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
