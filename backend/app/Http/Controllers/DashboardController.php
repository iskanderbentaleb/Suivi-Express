<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrderResource;
use App\Models\Agent;
use App\Models\Order;
use App\Models\StatusOrder;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Return dashboard statistics as JSON.
     */
    public function index()
    {
        // Get total orders
        $totalOrders = Order::count();

        // Get total agents
        $totalAgents = Agent::count();

        // Calculate delivery rate
        $deliveredOrders = Order::whereHas('status', fn($query) => $query->where('status', 'Livré'))->count();
        $completedOrders = Order::whereHas('status', fn($query) => $query->whereIn('status', [
            'Livré', 'Retourné au vendeur', 'Retourné vers vendeur', 'Retour à retirer'
        ]))->count();

        $deliveryRate = $completedOrders > 0 ? round(($deliveredOrders / $completedOrders) * 100, 2) : 0;

        // Fetch all statuses dynamically from `StatusOrder`
        $statusData = StatusOrder::orderBy('status')->get()->map(function ($status) use ($totalOrders) {
            $count = Order::whereHas('status', fn($query) => $query->where('status', $status->status))->count();
            return [
                'name' => $status->status,
                'value' => $totalOrders > 0 ? round(($count / $totalOrders) * 100, 2) : 0,
                'color' => $status->colorHex,
            ];
        });

        // Delivery Company Order Counts
        $deliveryCompanies = Order::with(['deliveryCompany', 'status'])
            ->get()
            ->groupBy('deliveryCompany.name')
            ->map(function ($orders, $companyName) {
                return [
                    'company' => $companyName,
                    'delivered' => $orders->where('status.status', 'Livré')->count(),
                    'returned' => $orders->whereIn('status.status', ['Retourné au vendeur', 'Retourné vers vendeur', 'Retour à retirer'])->count(),
                    'inProcess' => $orders->whereNotIn('status.status', ['Livré', 'Retourné au vendeur', 'Retourné vers vendeur', 'Retour à retirer'])->count(),
                ];
            })
            ->values();

        return response()->json([
            'total_orders' => $totalOrders,
            'delivery_rate' => $deliveryRate,
            'total_agents' => $totalAgents,
            'status_distribution' => $statusData,
            'delivery_companies' => $deliveryCompanies,
        ]);
    }

    /**
     * Fetch the minimum year from orders table.
     */
    public function getMinYear()
    {
        $minYear = Order::query()->min('created_at')
            ? Carbon::parse(Order::min('created_at'))->year
            : 2000; // Default to 2000 if no orders exist

        return response()->json(['min_year' => $minYear]);
    }

    /**
     * Fetch filtered orders for line chart based on selected year.
     */
    public function getOrdersByYear(Request $request)
    {
        // Get the minimum year from orders table dynamically
        $minYear = Order::query()->min('created_at')
            ? Carbon::parse(Order::min('created_at'))->year
            : 2000; // Default to 2000 if no orders exist

        // Validate the year input
        $request->validate([
            'year' => ['required', 'integer', 'min:' . $minYear, 'max:' . date('Y')],
        ]);

        $year = $request->year;

        // Define the start and end of the year
        $startDate = Carbon::create($year, 1, 1)->startOfDay();
        $endDate = Carbon::create($year, 12, 31)->endOfDay();

        // Fetch status IDs
        $deliveredStatusId = StatusOrder::where('status', 'Livré')->value('id');
        $returnedStatusIds = StatusOrder::whereIn('status', [
            'Retourné au vendeur', 'Retourné vers vendeur', 'Retour à retirer'
        ])->pluck('id')->toArray();

        // Fetch orders for the selected year
        $ordersData = Order::query()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw("
                DATE_FORMAT(created_at, '%Y-%m') as date,
                COUNT(*) as created_orders,
                SUM(CASE WHEN status_id = ? THEN 1 ELSE 0 END) as delivered_orders,
                SUM(CASE WHEN status_id IN (" . implode(',', array_fill(0, count($returnedStatusIds), '?')) . ") THEN 1 ELSE 0 END) as returned_orders
            ", array_merge([$deliveredStatusId], $returnedStatusIds))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()
            ->keyBy('date');

        // Ensure all months are included, even if no orders exist
        $allMonths = collect(range(1, 12))->mapWithKeys(function ($month) use ($year) {
            $formattedDate = Carbon::create($year, $month, 1)->format('Y-m');
            return [$formattedDate => [
                'date' => $formattedDate,
                'created_orders' => 0,
                'delivered_orders' => 0,
                'returned_orders' => 0,
            ]];
        });

        // Merge fetched data with all months ensuring correct order
        $ordersData = $allMonths->merge($ordersData)->sortKeys()->values();

        return response()->json([
            'data' => $ordersData->map(fn($order) => [
                'date' => $order['date'],
                'created_orders' => (int) $order['created_orders'],
                'delivered_orders' => (int) $order['delivered_orders'],
                'returned_orders' => (int) $order['returned_orders'],
            ]),
        ]);
    }
}
