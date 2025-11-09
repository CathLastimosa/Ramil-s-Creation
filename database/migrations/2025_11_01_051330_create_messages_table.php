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
        Schema::create('messages', function (Blueprint $table) {
            $table->bigIncrements('message_id');
            $table->string('subject', 255)->nullable();
            $table->text('message')->nullable();
            $table->string('attachment', 255)->nullable();
            $table->string('receiver_email', 255)->nullable();
            $table->unsignedBigInteger('sender_id')->nullable();
            $table->string('sender_type', 255)->nullable();
            $table->unsignedBigInteger('receiver_id')->nullable();
            $table->string('receiver_type', 255)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
