<?php

namespace App\Http\Resources;

use App\Helpers\DateTimeHelper;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {

        // Format created_at in French using the helper class
        $formattedCreatedAt = DateTimeHelper::formatTimestampInFrench(Carbon::parse($this->created_at));

        // Format updated_at in French using the helper class
        $formattedUpdatedAt = DateTimeHelper::formatTimestampInFrench(Carbon::parse($this->updated_at));


        return [
            'id' => $this->id,
            'message' => $this->message,
            'is_read' => $this->is_read, // Boolean field
            'created_at' => $formattedCreatedAt, // Formatted in French
            'updated_at' => $formattedUpdatedAt, // Formatted in French

            // Relationships (only included if loaded)
            'order' => $this->whenLoaded('order', function () {
                return [
                    'id' => $this->order->id,
                    'tracking' => $this->order->tracking,
                    'status' => $this->order->status ? [
                        'id' => $this->order->status->id,
                        'status' => $this->order->status->status,
                        'colorHex' => $this->order->status->colorHex,
                    ] : null,
                ];
            }),
            'sender_agent' => $this->whenLoaded('senderAgent', function () {
                return [
                    'id' => $this->senderAgent->id,
                    'name' => $this->senderAgent->name,
                    'email' => $this->senderAgent->email,
                ];
            }),
            'receiver_agent' => $this->whenLoaded('receiverAgent', function () {
                return [
                    'id' => $this->receiverAgent->id,
                    'name' => $this->receiverAgent->name,
                    'email' => $this->receiverAgent->email,
                ];
            }),
            'sender_admin' => $this->whenLoaded('senderAdmin', function () {
                return [
                    'id' => $this->senderAdmin->id,
                    'name' => $this->senderAdmin->name,
                    'email' => $this->senderAdmin->email,
                ];
            }),
            'receiver_admin' => $this->whenLoaded('receiverAdmin', function () {
                return [
                    'id' => $this->receiverAdmin->id,
                    'name' => $this->receiverAdmin->name,
                    'email' => $this->receiverAdmin->email,
                ];
            }),
            'status' => $this->whenLoaded('status', function () {
                return [
                    'id' => $this->status->id,
                    'name' => $this->status->status,
                ];
            }),
            'parent_mail' => $this->whenLoaded('parentMail', function () {
                return new MailResource($this->parentMail);
            }),
            'replies' => MailResource::collection($this->whenLoaded('replies')),
        ];
    }
}
