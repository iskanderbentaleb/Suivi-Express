<?php

namespace App\Http\Controllers\AgentControllers;

use App\Http\Controllers\Controller;
use App\Models\Reason;
use Illuminate\Http\Request;

class ReasonController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $reasons = Reason::all();
        return response()->json($reasons);
    }

}
