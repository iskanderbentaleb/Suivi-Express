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
    Route::apiResources(['agents' => AgentController::class]);
    Route::apiResources(['orders' => OrderController::class]);
    Route::put('/orders/{order}/status', [OrderController::class, 'updateStatus']);
    Route::get('delivery-companies', [DeliveryCompanyController::class, 'index']);
    Route::get('status-orders', [StatusOrderController::class, 'index']);
});




Route::middleware(['auth:sanctum' , 'ability:agent'])->prefix('agent')->group(static function(){
    Route::get('/', function (Request $request) {
        return $request->user();
    });
});

