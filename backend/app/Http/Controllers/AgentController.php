<?php

namespace App\Http\Controllers;

use App\Exports\AgentsExport;
use App\Http\Requests\Agent\StoreAgentRequest;
use App\Http\Requests\Agent\UpdateAgentRequest;
use App\Http\Resources\AgentResource;
use App\Models\Agent;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;


class AgentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->query('search', '');
        $sort = $request->query('sort', 'created_at'); // Default sort field
        $direction = $request->query('direction', 'desc'); // Default sort direction

        // Validate sort parameter (optional but recommended)
        $validSortFields = ['name', 'email', 'created_at', 'updated_at']; // Add other valid fields if needed
        if (!in_array($sort, $validSortFields)) {
            return response()->json(['error' => 'Invalid sort field'], 400);
        }

        // Build the query for the Agent model
        $query = Agent::withCount([
            'orders as livré_count' => function ($q) {
                $q->whereHas('status', function ($statusQuery) {
                    $statusQuery->where('status', 'Livré');
                });
            },
            'orders as retour_count' => function ($q) {
                $q->whereHas('status', function ($statusQuery) {
                    $statusQuery->where('status', 'Retourné au vendeur');
                });
            },
            'orders as orders_count',
        ]);

        // Apply search condition if a search term is provided
        if (!empty($search)) {
            $query->where(function ($subQuery) use ($search) {
                $subQuery->where('name', 'LIKE', "%$search%")
                         ->orWhere('email', 'LIKE', "%$search%");
            });
        }

        // Apply sorting
        $query->orderBy($sort, $direction);

        // Paginate the results
        $agents = $query->paginate(10);

        // Return paginated AgentResource collection
        return AgentResource::collection($agents);
    }


    // Export agents to Excel
    public function export()
    {
        return Excel::download(new AgentsExport, 'agents.xlsx');
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAgentRequest $request)
    {
        // Create Agent in database
        $category = Agent::create($request->validated());

        return response()->json([
            'message' => __('Agent created successfully'),
            'agent' => $category,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Agent $agent)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAgentRequest $request, Agent $agent)
    {
        // Update agent in database
        $agent->update($request->validated());

        return response()->json([
            'message' => __(key: 'agent updated successfully'),
            'agent' => $agent,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Agent $agent)
    {
        $agent->delete();
        return response()->json([
            'agent' => $agent ,
            'message' => __('Agent Deleted successfully!'),
        ]);
    }
}
