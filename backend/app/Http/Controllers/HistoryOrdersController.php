<?php

namespace App\Http\Controllers;

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
            'agent_id' => 'nullable|exists:agents,id',
            'order_id' => 'required|exists:orders,id',
            'history_judge' => 'required|boolean',
        ]);

        // Automatically fill user_id_validator with the authenticated user's ID
        $validated['user_id_validator'] = auth()->id();

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
        // Find the HistoryOrders entry
        $historyOrder = HistoryOrders::findOrFail($id);

        // Update only the user_id_validator column with the authenticated user's ID
        $historyOrder->update([
            'user_id_validator' => auth()->id(),
        ]);

        // Return a JSON response
        return response()->json([
            'message' => 'History order updated successfully',
            'data' => $historyOrder,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
