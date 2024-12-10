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
        Schema::create('orders', function (Blueprint $table) {
            $table->id(); // Primary key
            $table->string('tracking')->unique(); // Unique tracking string
            $table->string('external_id')->unique(); // Unique external ID string
            $table->string('client_name'); // Client name
            $table->string('client_lastname')->nullable(); // Last name (nullable)
            $table->string('phone' , 50); // Phone, can hold multiple numbers
            $table->foreignId('created_by')->constrained('users'); // Created by (foreign key from users table)
            $table->foreignId('affected_to')->nullable()->constrained('agents'); // Affected by (foreign key from agents table, nullable)
            $table->foreignId('status_id')->default(1)->constrained('status_orders'); // Status ID (foreign key from status_orders table, default 1)
            $table->foreignId('delivery_company_id')->nullable()->constrained('delivery_companies'); // Delivery company ID (foreign key from delivery_companies table, nullable)
            $table->string('product_url')->nullable(); // Product URL (nullable)
            $table->timestamps(); // Created at and updated at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
