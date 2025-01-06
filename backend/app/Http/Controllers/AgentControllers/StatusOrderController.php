<?php

namespace App\Http\Controllers\AgentControllers;

use App\Http\Controllers\Controller;
use App\Models\StatusOrder;
use Illuminate\Http\Request;

class StatusOrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $status_orders = StatusOrder::orderBy('status')->get();
        return response()->json($status_orders);
    }
}
