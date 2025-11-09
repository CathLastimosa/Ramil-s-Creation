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
        Schema::create('email_notifications', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('subject', 255)->nullable();
            $table->string('recipient_type')->nullable();
            $table->bigInteger('recipient_id')->nullable();
            $table->string('recipient_email', 255)->nullable();
            $table->bigInteger('sender_id')->nullable();
            $table->enum('type', ['reminder', 'announcement', 'message', 'confirmation', 'submission'])->nullable();
            $table->enum('status', ['pending', 'sent', 'failed'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_notifications');
    }
};
