<?php

namespace App\Imports;

use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\BeforeSheet;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Models\{Order, Agent, StatusOrder, DeliveryCompany};

class OrdersImport implements ToCollection, WithHeadingRow, WithMultipleSheets, WithEvents
{
    protected $errors;

    public function __construct(&$errors)
    {
        $this->errors = &$errors;
    }

    public function collection(Collection $rows)
    {
        // Get the authenticated user's ID
        $authUserId = auth()->id();

        foreach ($rows as $index => $row) {
            // Convert the row (Collection) to an array before logging
            Log::info('Processing row:', $row->toArray());

            // Validate the row
            $validator = Validator::make($row->toArray(), [
                'tracking' => 'required|unique:orders,tracking',
                'external_id' => 'nullable|string|max:255',
                'client_name' => 'required|string|max:255',
                'client_lastname' => 'nullable|string|max:255',
                'phone' => 'nullable|string|max:50',
                'product_url' => 'nullable|url',
                'status' => 'required|string|exists:status_orders,status',
                'affected_to' => 'nullable|string|exists:agents,name',
                'delivery_company' => 'nullable|string|exists:delivery_companies,name',
            ]);

            if ($validator->fails()) {
                // Add validation errors to the $errors array
                $this->errors[] = [
                    'row' => $index + 2, // Row number in the Excel file (add 2 for header row and 1-based index)
                    'errors' => $validator->errors()->toArray(),
                ];
                continue; // Skip invalid rows
            }

            try {
                // Fetch related models
                $affectedTo = $row['affected_to']
                    ? Agent::where('name', $row['affected_to'])->first()
                    : null;
                $status = StatusOrder::where('status', $row['status'])->first();
                $deliveryCompany = $row['delivery_company']
                    ? DeliveryCompany::where('name', $row['delivery_company'])->first()
                    : null;

                // Create the order
                Order::create([
                    'tracking' => $row['tracking'],
                    'external_id' => $row['external_id'],
                    'client_name' => $row['client_name'],
                    'client_lastname' => $row['client_lastname'],
                    'phone' => $row['phone'],
                    'product_url' => $row['product_url'],
                    'status_id' => $status->id,
                    'created_by' => $authUserId, // Automatically set the authenticated user's ID
                    'affected_to' => $affectedTo ? $affectedTo->id : null,
                    'delivery_company_id' => $deliveryCompany ? $deliveryCompany->id : null,
                ]);

                Log::info('Order created successfully for row:', $row->toArray());
            } catch (\Exception $e) {
                // Add the error to the $errors array
                $this->errors[] = [
                    'row' => $index + 2, // Row number in the Excel file
                    'error' => $e->getMessage(),
                ];
            }
        }
    }

    public function sheets(): array
    {
        return [
            'Template' => $this, // Import only the 'Template' sheet
        ];
    }

    public function registerEvents(): array
    {
        return [
            BeforeSheet::class => function (BeforeSheet $event) {
                // Check the sheet name before processing
                if ($event->getSheet()->getTitle() !== 'Template') {
                    // Skip sheets that are not named 'Template'
                    $event->getSheet()->disconnect();
                }
            },
        ];
    }
}
