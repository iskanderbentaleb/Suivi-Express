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
            $table->unsignedBigInteger('sender_id'); // Sender ID (no foreign key constraint)
            $table->unsignedBigInteger('receiver_id'); // Receiver ID (no foreign key constraint)
            $table->enum('sender_type', ['admin_to_agent', 'agent_to_admin']); // ENUM with allowed values
            $table->text('message'); // Mail body content
            $table->boolean('is_read')->default(false); // Whether the mail is read (default: false)
            $table->unsignedBigInteger('status_id'); // Foreign key for mail status
            $table->unsignedBigInteger('mail_id')->nullable(); // Foreign key for mail (replies)
            $table->timestamps(); // created_at and updated_at

            // Define foreign key relationships
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade'); // Delete mail if order is deleted
            $table->foreign('status_id')->references('id')->on('mail_statuses')->onDelete('restrict'); // Prevent deletion if referenced
            $table->foreign('mail_id')->references('id')->on('mails')->onDelete('set null'); // Set to NULL if referenced mail is deleted

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
