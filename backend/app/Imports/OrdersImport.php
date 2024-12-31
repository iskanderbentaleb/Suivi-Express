<?php

namespace App\Imports;

use App\Models\Order;
use App\Models\StatusOrder;
use App\Models\User;
use App\Models\DeliveryCompany;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\Validator;


class OrdersImport implements ToCollection, WithHeadingRow
{
    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            // Validate the row without the status field
            $validator = Validator::make($row->toArray(), [
                'tracking' => 'required|unique:orders,tracking',
                'client_name' => 'required',
                'phone' => 'nullable|max:50',
                'created_by' => 'required|exists:users,name',
                'affected_to' => 'nullable|exists:users,name',
                'delivery_company' => 'nullable|exists:delivery_companies,name',
            ]);

            if ($validator->fails()) {
                \Log::warning('Row skipped due to validation errors.', [
                    'row' => $row->toArray(),
                    'errors' => $validator->errors()->toArray(),
                ]);
                continue;
            }

            try {
                // Find or create related models
                $createdBy = User::firstWhere('name', $row['created_by']);
                $affectedTo = $row['affected_to']
                    ? User::firstWhere('name', $row['affected_to'])
                    : null;
                $deliveryCompany = $row['delivery_company']
                    ? DeliveryCompany::firstWhere('name', $row['delivery_company'])
                    : null;

                // Set a default status ID, e.g., 1
                $defaultStatusId = 1; // Replace this with the appropriate default status ID

                // Insert or update the order
                Order::updateOrCreate(
                    ['tracking' => $row['tracking']],
                    [
                        'external_id' => $row['external_id'] ?? null,
                        'client_name' => $row['client_name'],
                        'client_lastname' => $row['client_lastname'] ?? null,
                        'phone' => $row['phone'] ?? null,
                        'created_by' => $createdBy?->id,
                        'affected_to' => $affectedTo?->id,
                        'delivery_company_id' => $deliveryCompany?->id,
                        'status_id' => $defaultStatusId, // Set default status ID
                        'product_url' => $row['product_url'] ?? null,
                    ]
                );
            } catch (\Exception $e) {
                \Log::error('Failed to process row.', [
                    'row' => $row->toArray(),
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

}
