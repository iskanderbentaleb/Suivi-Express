<?php

use App\Models\Mail;
use Illuminate\Support\Facades\Broadcast;

// Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
//     return (int) $user->id === (int) $id;
// });

// Broadcast::channel('chat', function ($user) {
//     return true; // Allow all users for testing
// });

// Broadcast::channel('messages.{userId}', function ($user, $userId) {
//     return (int) $user->id === (int) $userId;
// });

// Broadcast::channel('my-channel', function ($user, $userId) {
//     return (int) $user->id === (int) $userId;
// });


// Broadcast::channel('private-messages.{userId}', function ($user, $userId) {
//     return (int) $user->id === (int) $userId;
// });


Broadcast::channel('order-room.{orderId}', function ($user, $orderId) {
    $mail = Mail::where('order_id', $orderId)
        ->latest('created_at') // ✅ Get the last mail for the order
        ->first();

    if (!$mail) {
        return false; // ❌ No mail found for this order
    }

    // ✅ Allow access if the user is sender or receiver (admin or agent)
    return in_array($user->id, [
        $mail->sender_agent_id,
        $mail->receiver_agent_id,
        $mail->sender_admin_id,
        $mail->receiver_admin_id,
    ]);
});
