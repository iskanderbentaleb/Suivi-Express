<?php

namespace App\Http\Resources;

use App\Helpers\DateTimeHelper;
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
        // Format created_at using the helper class
        $formattedCreatedAt = DateTimeHelper::formatTimestampInFrench(Carbon::parse($this->created_at));
        $formattedUpdatedAt = DateTimeHelper::formatTimestampInFrench(Carbon::parse($this->updated_at));

        return [
            'id' => $this->id,
            'note' => $this->note,
            'timetook' => $this->timetook,
            'history_judge' => $this->history_judge,
            'created_at' => $formattedCreatedAt,
            'updated_at' => $formattedUpdatedAt,
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
