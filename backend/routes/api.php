<?php

use App\Http\Controllers\AgentController;
use App\Http\Controllers\DeliveryCompanyController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\StatusOrderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::middleware(['auth:sanctum' , 'ability:admin'])->prefix('admin')->group(static function(){
    Route::get('/', function (Request $request) {
        return $request->user();
    });
    Route::get('/agents/export', [AgentController::class, 'export']);
    Route::apiResources(['agents' => AgentController::class]);

    Route::get('/orders/todaytask', action: [OrderController::class, 'tasktoday']);
    Route::put('/orders/{order}/status', [OrderController::class, 'updateStatus']);
    Route::get('orders/{order}/history', [OrderController::class, 'getOrderHistory']);
    Route::get('/orders/export', [OrderController::class, 'export']);
    Route::post('/orders/import', [OrderController::class, 'import']);
    Route::get('/orders/download-template', [OrderController::class, 'downloadTemplate']);
    Route::apiResources(['orders' => OrderController::class]);

    Route::get('delivery-companies', [DeliveryCompanyController::class, 'index']);
    Route::get('status-orders', [StatusOrderController::class, 'index']);

});




Route::middleware(['auth:sanctum' , 'ability:agent'])->prefix('agent')->group(static function(){
    Route::get('/', function (Request $request) {
        return $request->user();
    });
});

