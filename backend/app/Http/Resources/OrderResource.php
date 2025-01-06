<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tracking' => $this->tracking,
            'external_id' => $this->external_id,
            'client_name' => $this->client_name,
            'client_lastname' => $this->client_lastname,
            'phone' => $this->phone,
            'product_url' => $this->product_url,
            'archive' => $this->archive,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'status' => $this->status ? [
                'id' => $this->status->id,
                'status' => $this->status->status,
                'colorHex' => $this->status->colorHex,
            ] : null,
            'created_by' => $this->createdBy ? [
                'id' => $this->createdBy->id,
                'name' => $this->createdBy->name,
            ] : null,
            'affected_to' => $this->affectedTo ? [
                'id' => $this->affectedTo->id,
                'name' => $this->affectedTo->name,
            ] : null,
            'delivery_company' => $this->deliveryCompany ? [
                'id' => $this->deliveryCompany->id,
                'name' => $this->deliveryCompany->name,
                'colorHex' => $this->deliveryCompany->colorHex,
            ] : null,
        ];
    }
}
