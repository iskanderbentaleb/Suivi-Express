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
        Schema::create('history_orders', function (Blueprint $table) {
            $table->id(); // Primary key
            $table->string('note')->nullable(); // Note column
            $table->time('timetook')->nullable(); // Time took column
            $table->foreignId('reason_id')->nullable()->constrained('reasons')->onDelete('restrict'); // Foreign key for reasons
            $table->foreignId('agent_id')->nullable()->constrained('agents')->onDelete('restrict'); // Foreign key for agents
            $table->unsignedBigInteger('order_id'); // Foreign key for orders
            $table->timestamps(); // Timestamps for created_at and updated_at

            // Foreign key constraints with restrict
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade'); // Cascade delete on order_id
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('history_orders');
    }
};
