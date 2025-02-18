<?php

use App\Http\Controllers\AgentController;
use App\Http\Controllers\DeliveryCompanyController;
use App\Http\Controllers\MailController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ReasonController;
use App\Http\Controllers\StatusOrderController;

use App\Http\Controllers\AgentControllers\OrderController as OrderAgentController;
use App\Http\Controllers\AgentControllers\ReasonController as ReasonAgentController;
use App\Http\Controllers\AgentControllers\StatusOrderController as StatusOrderAgentController;
use App\Http\Controllers\HistoryOrdersController;
use App\Http\Controllers\AgentControllers\HistoryOrdersController as HistoryOrdersAgentController;
use App\Http\Controllers\AgentControllers\MailController as MailControllerAgentController;

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
    Route::put('/orders/{order}/archive', [OrderController::class, 'updateArchive']);
    Route::apiResources(['orders' => OrderController::class]);

    Route::apiResources(['HistoryOrders' => HistoryOrdersController::class]);

    Route::get('/reasons-calls', [ReasonController::class, 'index']);
    Route::get('delivery-companies', [DeliveryCompanyController::class, 'index']);
    Route::get('status-orders', [StatusOrderController::class, 'index']);


    // mail
    Route::get('mails', [MailController::class, 'inbox']); // Get all mails
    Route::get('mails/{orderId}', [MailController::class, 'selectedOrderMessagesInbox']); // Get all mails
    Route::post('mails/sent-message', [MailController::class, 'sentMessages']);


});




Route::middleware(['auth:sanctum' , 'ability:agent'])->prefix('agent')->group(static function(){
    Route::get('/', function (Request $request) {
        return $request->user();
    });

    Route::get('/orders/todaytask', action: [OrderAgentController::class, 'tasktoday']);
    Route::get('/orders/export', action: [OrderAgentController::class, 'export']);
    Route::put('/orders/{order}/status', [OrderAgentController::class, 'updateStatus']);
    Route::get('orders/{order}/history', [OrderAgentController::class, 'getOrderHistory']);
    Route::apiResources(['orders' => OrderAgentController::class]);

    Route::apiResources(['HistoryOrders' => HistoryOrdersAgentController::class]);

    Route::get('/reasons-calls', [ReasonAgentController::class, 'index']);
    Route::get('status-orders', [StatusOrderAgentController::class, 'index']);


    // mail
    Route::get('mails', [MailControllerAgentController::class, 'inbox']); // Get all mails
    Route::get('mails/{orderId}', [MailControllerAgentController::class, 'selectedOrderMessagesInbox']); // Get all mails
    Route::post('mails/sent-message', [MailControllerAgentController::class, 'sentMessages']);


});

