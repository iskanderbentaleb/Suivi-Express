<?php

namespace App\Http\Controllers\AgentControllers;

use App\Exports\OrdersExport;
use App\Http\Controllers\Controller;
use App\Http\Resources\HistoryOrdersResource;
use App\Models\HistoryOrders;
use App\Models\Order;
use App\Http\Resources\OrderResource;
use App\Http\Requests\Order\StoreOrderRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{

    public function index(Request $request)
    {
        // Retrieve the search query from request
        $search = $request->input('search');

        // Build the query
        $query = Order::with(['status:id,status,colorHex', 'deliveryCompany:id,name,colorHex', 'affectedTo:id,name', 'createdBy:id,name'])
            ->orderBy('updated_at', 'desc')
            ->where('affected_to', '=', auth()->id());

        // Apply search filter if a search term exists
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->Where('tracking', 'like', "%{$search}%")
                  ->orWhere('external_id', 'like', "%{$search}%")
                  ->orWhere('client_name', 'like', "%{$search}%")
                  ->orWhere('client_lastname', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('product_url', 'like', "%{$search}%")
                  ->orWhereHas('status', function ($q) use ($search) {
                      $q->where('status', 'like', "%{$search}%");
                  })
                  ->orWhereHas('deliveryCompany', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('affectedTo', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('createdBy', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Paginate the results
        $orders = $query->paginate(10);

        // Return the collection as a resource
        return OrderResource::collection($orders);
    }

    public function export()
    {
        return Excel::download(new OrdersExport, 'orders.xlsx');
    }


    public function tasktoday(Request $request)
    {
        // Retrieve the search query from request
        $search = $request->input('search');

        $today = now()->toDateString();

        // Query to retrieve orders for the authenticated agent
        $orders = Order::with([
            'status:id,status,colorHex',
            'deliveryCompany:id,name,colorHex',
            'affectedTo:id,name',
            'createdBy:id,name',
        ])
        // Filter orders where affected_to = auth()->id
        ->where('affected_to', auth()->id())

        // Exclude orders with status 'Retourné au vendeur' or 'Livré'
        ->whereHas('status', function ($query) {
            $query->whereNotIn('status', ['Retourné au vendeur', 'Livré']);
        })

        // Apply conditions for history_orders
        ->where(function ($query) use ($today) {
            // Include orders with no history_orders
            $query->whereDoesntHave('historyOrders')

                // Include orders with history_orders
                ->orWhereHas('historyOrders', function ($subQuery) use ($today) {
                    $subQuery->whereIn('id', function ($query) {
                        $query->selectRaw('MAX(id)')
                            ->from('history_orders')
                            ->groupBy('order_id');
                    })
                    ->where(function ($subSubQuery) use ($today) {
                        // Include if the latest history_order is not from today
                        $subSubQuery->whereDate('updated_at', '!=', $today);
                    });
                });
        })

        // Order by latest update
        ->orderBy('updated_at', 'desc');

        // Apply search filter if a search term exists
        if ($search) {
            $orders->where(function ($q) use ($search) {
                $q->Where('tracking', 'like', "%{$search}%")
                  ->orWhere('external_id', 'like', "%{$search}%")
                  ->orWhere('client_name', 'like', "%{$search}%")
                  ->orWhere('client_lastname', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('product_url', 'like', "%{$search}%")
                  ->orWhereHas('status', function ($q) use ($search) {
                      $q->where('status', 'like', "%{$search}%");
                  })
                  ->orWhereHas('deliveryCompany', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('affectedTo', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('createdBy', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Paginate the results
        $orders = $orders->paginate(10);

        // Return the collection as a resource
        return OrderResource::collection($orders);
    }

    public function store(StoreOrderRequest $request)
    {
        try {
            // Extract validated data from the request
            $validatedData = $request->validated();

            // Create the order using the validated data
            $order = Order::create([
                'delivery_company_id' => $validatedData['deleveryCompany'],
                'tracking' => $validatedData['tracking'],
                'external_id' => $validatedData['external_id'],
                'client_name' => $validatedData['client_name'],
                'client_lastname' => $validatedData['client_lastname'] ?? null, // Nullable
                'phone' => $validatedData['phone'],
                'affected_to' => $validatedData['affected_to'],
                'created_by' => auth()->id(), // Use the authenticated user's ID
                'status_id' => 1, // Default status
                'product_url' => $validatedData['product_url'] ?? null, // Nullable
            ]);

            // Return a success response
            return response()->json([
                'message' => 'Order created successfully!',
                'order' => $order,
            ], 201);
        } catch (\Exception $e) {
            // Log the error for debugging
            \Log::error('Order Creation Failed: ' . $e->getMessage());

            // Return an error response
            return response()->json([
                'message' => 'Failed to create order. Please try again.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(Order $order)
    {
        //
    }

    public function update(Request $request, Order $order)
    {
        // Define validation rules
        $rules = [
            'client_name' => ['required', 'string', 'min:3'], // At least 3 characters
            'client_lastname' => ['nullable', 'string', 'min:3'], // Nullable but at least 3 characters if provided
            'phone' => ['required', 'string', 'max:50', 'regex:/^[\d\s+-]+$/'], // Allows digits, spaces, '+' and '-'
            'product_url' => ['nullable', 'string', 'min:3'], // Nullable but at least 3 characters if provided
        ];

        // Validate the request data
        $validator = Validator::make($request->all(), $rules);

        // If validation fails, throw an exception
        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        // Get validated data
        $validated = $validator->validated();


        // Update the order with validated data
        $order->update([
            'client_name' => $validated['client_name'],
            'client_lastname' => $validated['client_lastname'] ?? null, // Use null if not provided
            'phone' => $validated['phone'],
            'product_url' => $validated['product_url'],
        ]);

        // Return a success response (e.g., JSON or redirect)
        return response()->json([
            'message' => 'Order updated successfully',
            'order' => $order,
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        // Validate the incoming request data
        $validator = Validator::make($request->all(), [
            'statusId' => 'required|exists:status_orders,id', // 'status_orders' should be the table name for status options
        ]);

        // If validation fails, return errors
        if ($validator->fails()) {
            return response()->json([
                'error' => $validator->errors()
            ], 400);
        }

        // Update the order's status
        try {
            $order->status_id = $request->statusId; // Ensure 'statusId' is correctly used here
            $order->save();

            return response()->json([
                'message' => 'Order status updated successfully',
                'order' => $order // You can return the updated order details if needed
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update order status: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getOrderHistory(Order $order)
    {
        $historyOrders = HistoryOrders::with(['reason', 'agent'])
        ->where('order_id', $order->id)
        ->orderBy('id', 'desc')
        ->get();

        if ($historyOrders->isEmpty()) {
            return response()->json([
                'message' => 'No history orders found for this order.',
            ], 404);
        }

        return response()->json([
            'data' => HistoryOrdersResource::collection($historyOrders),
            'message' => 'History orders retrieved successfully.',
        ], 200);
    }

    public function destroy()
    {
    }

}
