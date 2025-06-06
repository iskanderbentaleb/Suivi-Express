<?php

namespace App\Http\Controllers\AgentControllers;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Http\Resources\MailResource;
use App\Models\Mail;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Pagination\LengthAwarePaginator;

class MailController extends Controller
{


    /**
     * Display inbox messages grouped by order.
     */
    public function inbox()
    {


        $agentId = Auth::id();
        $searchTerm = request('search', '');
        $isRead = request('is_read', 'all'); // 'all', 'read', 'unread'
        $typeMessage = request('typeMessage', 'receive'); // 'receive', 'sent'

        // Fetch mails with necessary conditions
        $mails = Mail::when($isRead !== 'all', function ($query) use ($isRead) {
                return $query->where('is_read', $isRead === 'read' ? true : false);
            })
            ->when($typeMessage === 'receive', function ($query) use ($agentId) {
                // ===== Received Messages for Admin =====
                return $query->
                        whereNotNull('sender_admin_id')
                        ->whereNotNull('receiver_agent_id')
                        ->whereNull('receiver_admin_id')
                        ->whereNull('sender_agent_id')
                        ->where('receiver_agent_id', $agentId);
            })
            ->when($typeMessage === 'sent', function ($query) use ($agentId) {
                // ===== Sent Messages by Admin =====
                return $query->whereNull('sender_admin_id')
                        ->whereNull('receiver_agent_id')
                        ->whereNotNull('receiver_admin_id')
                        ->whereNotNull('sender_agent_id')
                        ->where('sender_agent_id', $agentId);
            })
            ->with([
                'order.status',
                'senderAgent',
                'receiverAgent',
                'senderAdmin',
                'receiverAdmin',
                'status',
                'parentMail',
                'replies'
            ])
            ->orderBy('created_at', 'desc')
            ->get();


        // Apply search filtering
        if (!empty($searchTerm)) {
            $mails = $mails->filter(function ($mail) use ($searchTerm) {
                return str_contains(strtolower($mail->message), strtolower($searchTerm))
                    || str_contains(strtolower($mail->order->tracking ?? ''), strtolower($searchTerm))
                    || str_contains(strtolower($mail->senderAgent->name ?? ''), strtolower($searchTerm))
                    || str_contains(strtolower($mail->receiverAdmin->name ?? ''), strtolower($searchTerm));
            });
        }

        // Group mails by order
        $groupedMails = $mails->groupBy('order_id');

        // Transform grouped results
        $transformedMails = $groupedMails->map(function ($mails, $orderId) {
            $latestMail = $mails->first();
            $mailCount = $mails->count();

            return [
                'order' => [
                    'id' => $latestMail->order->id,
                    'tracking' => $latestMail->order->tracking,
                    'status' => $latestMail->order->status ? [
                        'id' => $latestMail->order->status->id,
                        'status' => $latestMail->order->status->status,
                        'colorHex' => $latestMail->order->status->colorHex,
                    ] : null,
                ],
                'latest_mail' => new MailResource($latestMail),
                'mail_count' => $mailCount,
            ];
        });

        // Pagination setup
        $page = request('page', 1);
        $perPage = 20;
        $total = $transformedMails->count();

        $paginatedResults = new LengthAwarePaginator(
            $transformedMails->forPage($page, $perPage),
            $total,
            $perPage,
            $page,
            ['path' => request()->url(), 'query' => request()->query()]
        );

        // Generate pagination links
        $links = [
            [
                'url' => $paginatedResults->previousPageUrl(),
                'label' => '&laquo; Previous',
                'active' => $paginatedResults->currentPage() > 1
            ],
            ...collect(range(1, $paginatedResults->lastPage()))->map(fn ($pageNumber) => [
                'url' => $paginatedResults->url($pageNumber),
                'label' => (string) $pageNumber,
                'active' => $pageNumber === $paginatedResults->currentPage()
            ])->toArray(),
            [
                'url' => $paginatedResults->nextPageUrl(),
                'label' => 'Next &raquo;',
                'active' => $paginatedResults->currentPage() < $paginatedResults->lastPage()
            ]
        ];

        return response()->json([
            'data' => $paginatedResults->items(),
            'meta' => [
                'current_page' => $paginatedResults->currentPage(),
                'from' => $paginatedResults->firstItem(),
                'last_page' => $paginatedResults->lastPage(),
                'links' => $links,
                'path' => request()->url(),
                'per_page' => $paginatedResults->perPage(),
                'to' => $paginatedResults->lastItem(),
                'total' => $paginatedResults->total(),
            ]
        ]);
    }

    /**
     * Display messages that selected by id
    */
    public function selectedOrderMessagesInbox($orderId)
    {


        // Validate that the orderId exists in the orders table
        if (!Order::where('id', $orderId)->exists()) {
            return response()->json([
                'message' => 'Order not found.',
            ], 404);
        }




        try {
            // Update all messages related to the order to mark them as read
            $agentId = Auth::id();
            Mail::where('order_id', $orderId)
            ->whereNotNull('sender_admin_id')
            ->whereNotNull('receiver_agent_id')
            ->whereNull('receiver_admin_id')
            ->whereNull('sender_agent_id')
            ->where('receiver_agent_id', $agentId)
            ->update(['is_read' => 1]);




            // Fetch paginated mails related to the given orderId
            $mails = Mail::where('order_id', $orderId)
                         ->with([
                            'order.status', // Ensure 'order' and 'status' relationships exist
                            'senderAgent',  // Ensure 'senderAgent' relationship exists
                            'receiverAgent', // Ensure 'receiverAgent' relationship exists
                            'senderAdmin',  // Ensure 'senderAdmin' relationship exists
                            'receiverAdmin', // Ensure 'receiverAdmin' relationship exists
                            'status',       // Ensure 'status' relationship exists
                            'parentMail',   // Ensure 'parentMail' relationship exists
                            'replies'       // Ensure 'replies' relationship exists
                         ])
                         ->get(); // Paginate the results, 20 items per page

            // Return paginated response using MailResource
            return response()->json([
                'data' => MailResource::collection($mails)
            ]);

        } catch (\Exception $e) {
            // Handle any exceptions that occur
            return response()->json([
                'message' => 'An error occurred while fetching the mails.',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /**
     *  Sent messages
    */
    public function sentMessages(Request $request)
    {
        $request->validate([
            'tracking' => 'required|string|exists:orders,tracking',
            'message' => 'required|string|min:1',
        ]);

        $order = Order::where('tracking', $request->tracking)->firstOrFail();

        if (!$order->affected_to) {
            return response()->json(['error' => 'No agent assigned to this order.'], 400);
        }

        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Create new mail message
        $mail = Mail::create([
            'order_id' => $order->id,
            'sender_agent_id' => Auth::id(),
            'receiver_admin_id' => $order->created_by,
            'message' => $request->message,
            'status_id' => 1,
        ]);

        // Broadcast event
        broadcast(new MessageSent($mail))->toOthers();

        // Return formatted response using MailResource
        return response()->json([
            'message' => 'Message sent.',
            'data' => new MailResource($mail) // ✅ Use MailResource to format response
        ]);
    }


}
