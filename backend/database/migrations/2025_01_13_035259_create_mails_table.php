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
        Schema::create('mails', function (Blueprint $table) {
            $table->id(); // Primary key
            $table->unsignedBigInteger('order_id'); // Foreign key for orders

            // Sender and Receiver IDs
            $table->unsignedBigInteger('sender_agent_id')->nullable(); // Foreign key for sender agent
            $table->unsignedBigInteger('receiver_agent_id')->nullable(); // Foreign key for receiver agent
            $table->unsignedBigInteger('sender_admin_id')->nullable(); // Foreign key for sender admin
            $table->unsignedBigInteger('receiver_admin_id')->nullable(); // Foreign key for receiver admin

            $table->text('message'); // Mail body content
            $table->boolean('is_read')->default(false); // Whether the mail is read (default: false)
            $table->unsignedBigInteger('status_id'); // Foreign key for mail status
            $table->unsignedBigInteger('mail_id')->nullable(); // Foreign key for mail (replies)

            $table->timestamps(); // created_at and updated_at

            // Define foreign key relationships
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade'); // Delete mail if order is deleted
            $table->foreign('status_id')->references('id')->on('mail_statuses')->onDelete('restrict'); // Prevent deletion if referenced
            $table->foreign('mail_id')->references('id')->on('mails')->onDelete('set null'); // Set to NULL if referenced mail is deleted

            // Foreign keys for sender/receiver agents and admins
            $table->foreign('sender_agent_id')->references('id')->on('agents')->onDelete('restrict');
            $table->foreign('receiver_agent_id')->references('id')->on('agents')->onDelete('restrict');
            $table->foreign('sender_admin_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('receiver_admin_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mails');
    }
};
