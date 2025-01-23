<?php

namespace App\Http\Controllers;

use App\Http\Resources\MailResource;
use App\Models\Mail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MailController extends Controller
{
    /**
     * Display inbox messages
     */
    public function inbox()
    {
        // Get the authenticated user's ID
        $adminId = Auth::id();

        // Query the mails based on the conditions
        $mails = Mail::whereNotNull('sender_agent_id') // sender_agent_id is not null
            ->whereNotNull('receiver_admin_id') // receiver_admin_id is not null
            ->whereNull('receiver_agent_id') // receiver_agent_id is null
            ->whereNull('sender_admin_id') // sender_admin_id is null
            ->where('receiver_admin_id', $adminId) // receiver_admin_id matches the authenticated admin's ID
            ->orderBy('created_at', 'desc') // Sort by latest first
            ->with(['order', 'senderAgent', 'receiverAgent', 'senderAdmin', 'receiverAdmin', 'status', 'parentMail', 'replies']) // Eager load relationships
            ->paginate(20);

        // Return the filtered mails as a JSON response using MailResource
        return MailResource::collection($mails);
    }

    /**
     * Display Display sent messages
    */
    public function sent()
    {

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
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
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
