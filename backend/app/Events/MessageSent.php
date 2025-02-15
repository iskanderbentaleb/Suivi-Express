<?php

namespace App\Events;

use App\Helpers\DateTimeHelper;
use App\Http\Resources\MailResource;
use App\Models\Mail;
use Carbon\Carbon;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use InteractsWithSockets, SerializesModels;

    public $mail;

    public function __construct(Mail $mail)
    {
        $this->mail = $mail;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('private-messages.' . $this->mail->sender_admin_id);
    }

    public function broadcastAs()
    {
        return 'my-event'; // ✅ Ensure this matches React listener
    }


    public function broadcastWith()
    {
        // Format timestamps in French
        $formattedCreatedAt = DateTimeHelper::formatTimestampInFrench(Carbon::parse($this->mail->created_at));
        $formattedUpdatedAt = DateTimeHelper::formatTimestampInFrench(Carbon::parse($this->mail->updated_at));

        return [
            'id' => $this->mail->id,
            'message' => $this->mail->message,
            'is_read' => $this->mail->is_read,
            'created_at' => $formattedCreatedAt,
            'updated_at' => $formattedUpdatedAt,

            // ✅ Safely check if relations exist before accessing properties
            'order' => $this->mail->order ? [
                'id' => $this->mail->order->id,
                'tracking' => $this->mail->order->tracking,
                'status' => $this->mail->order->status ? [
                    'id' => $this->mail->order->status->id,
                    'status' => $this->mail->order->status->status,
                    'colorHex' => $this->mail->order->status->colorHex,
                ] : null,
            ] : null,

            'sender_agent' => $this->mail->senderAgent ? [
                'id' => $this->mail->senderAgent->id,
                'name' => $this->mail->senderAgent->name,
                'email' => $this->mail->senderAgent->email,
            ] : null,

            'receiver_agent' => $this->mail->receiverAgent ? [
                'id' => $this->mail->receiverAgent->id,
                'name' => $this->mail->receiverAgent->name,
                'email' => $this->mail->receiverAgent->email,
            ] : null,

            'sender_admin' => $this->mail->senderAdmin ? [
                'id' => $this->mail->senderAdmin->id,
                'name' => $this->mail->senderAdmin->name,
                'email' => $this->mail->senderAdmin->email,
            ] : null,

            'receiver_admin' => $this->mail->receiverAdmin ? [
                'id' => $this->mail->receiverAdmin->id,
                'name' => $this->mail->receiverAdmin->name,
                'email' => $this->mail->receiverAdmin->email,
            ] : null,

            'status' => $this->mail->status ? [
                'id' => $this->mail->status->id,
                'name' => $this->mail->status->status,
            ] : null,

            'parent_mail' => $this->mail->parentMail ? new MailResource($this->mail->parentMail) : null,

            // ✅ Ensure replies is always an array
            'replies' => MailResource::collection($this->mail->replies ?? []),
        ];
    }

}
