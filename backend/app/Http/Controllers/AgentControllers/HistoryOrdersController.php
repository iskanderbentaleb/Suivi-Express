<?php

namespace App\Http\Controllers\AgentControllers;

use App\Http\Controllers\Controller;
use App\Models\HistoryOrders;
use Illuminate\Http\Request;

class HistoryOrdersController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate the request data
        $validated = $request->validate([
            'note' => 'nullable|string',
            'timetook' => 'nullable|date_format:H:i:s',
            'reason_id' => 'nullable|exists:reasons,id',
            'status_order_id' => 'required|exists:status_orders,id',
            'order_id' => 'required|exists:orders,id',
            'history_judge' => 'required|boolean',
        ]);

        // Automatically fill user_id_validator with the authenticated user's ID
        $validated['agent_id'] = auth()->id();

        // Create a new HistoryOrders entry
        $historyOrder = HistoryOrders::create($validated);

        // Return a JSON response
        return response()->json([
            'message' => 'History order created successfully',
            'data' => $historyOrder,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
