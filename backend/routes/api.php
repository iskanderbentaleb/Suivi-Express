<?php

use App\Http\Controllers\AgentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::middleware(['auth:sanctum' , 'ability:admin'])->prefix('admin')->group(static function(){
    Route::get('/', function (Request $request) {
        return $request->user();
    });
    Route::apiResources(['agents' => AgentController::class]);
});




Route::middleware(['auth:sanctum' , 'ability:agent'])->prefix('agent')->group(static function(){
    Route::get('/', function (Request $request) {
        return $request->user();
    });
});

