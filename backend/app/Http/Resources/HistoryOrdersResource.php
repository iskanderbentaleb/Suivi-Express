<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HistoryOrdersResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {

        $createdAt = $this->created_at;
        $now = Carbon::now();

        // Determine the formatted date
        if ($createdAt->isToday()) {
            $formattedCreatedAt = "Today at " . $createdAt->format('H:i');
        } elseif ($createdAt->isYesterday()) {
            $formattedCreatedAt = "Yesterday at " . $createdAt->format('H:i');
        } elseif ($createdAt->greaterThan($now->subWeek())) {
            $formattedCreatedAt = $createdAt->format('l \a\t H:i'); // Day of the week with time
        } else {
            $formattedCreatedAt = $createdAt->format('Y-m-d H:i');
        }

        return [
            'id' => $this->id,
            'note' => $this->note,
            'timetook' => $this->timetook,
            'history_judge' => $this->history_judge,
            'created_at' => $formattedCreatedAt,
            'updated_at' => $this->updated_at,
            'reason' => $this->reason ? [
                'id' => $this->reason->id,
                'reason' => $this->reason->reason,
            ] : null,
            'status' => $this->status ? [
                'id' => $this->status->id,
                'status' => $this->status->status,
            ] : null,
            'agent' => $this->agent ? [
                'id' => $this->agent->id,
                'name' => $this->agent->name,
                'email' => $this->agent->email,
                'role' => $this->agent->role,
            ] : [
                'id' => $this->admin->id,
                'name' => $this->admin->name,
                'email' => $this->admin->email,
                'role' => $this->admin->role,
                ]
            ,
            'validator' => $this->admin ? [
                'id' => $this->admin->id,
                'name' => $this->admin->name,
                'email' => $this->admin->email,
                'role' => $this->admin->role,
            ] : null,
        ];
    }
}
