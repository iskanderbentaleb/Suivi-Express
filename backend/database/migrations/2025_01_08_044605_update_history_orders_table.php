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
        Schema::table('history_orders', function (Blueprint $table) {
            // Make the reason_id column nullable
            $table->unsignedBigInteger('reason_id')->nullable()->change();

            // Add the status_order_id column as a foreign key
            $table->unsignedBigInteger('status_order_id')->after('reason_id');
            $table->foreign('status_order_id')->references('id')->on('status_orders')->onDelete('cascade');

            // Add the history_judge column
            $table->boolean('history_judge')->default(false)->after('order_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('history_orders', function (Blueprint $table) {
            // Reverse the reason_id nullable change
            $table->unsignedBigInteger('reason_id')->nullable(false)->change();

            // Drop the foreign key and status_order_id column
            $table->dropForeign(['status_order_id']);
            $table->dropColumn('status_order_id');

            // Drop the history_judge column
            $table->dropColumn('history_judge');
        });
    }
};
