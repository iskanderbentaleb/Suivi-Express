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
use PhpOffice\PhpSpreadsheet\Shared\Date;

class OrdersImport implements ToCollection, WithHeadingRow, WithMultipleSheets, WithEvents
{
    protected $errors;

    public function __construct(&$errors)
    {
        $this->errors = &$errors;
    }

    public function collection(Collection $rows)
    {
        $authUserId = auth()->id();

        foreach ($rows as $index => $row) {
            if ($this->isRowEmpty($row)) {
                continue;
            }

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
                'archived' => 'nullable|boolean', // New validation
                'created_at' => 'nullable|date_format:Y-m-d H:i:s',
            ]);

            if ($validator->fails()) {
                $this->errors[] = [
                    'row' => $index + 2,
                    'errors' => $validator->errors()->toArray(),
                ];
                continue;
            }

            try {
                $affectedTo = $row['affected_to']
                    ? Agent::where('name', $row['affected_to'])->first()
                    : null;
                $status = StatusOrder::where('status', $row['status'])->first();
                $deliveryCompany = $row['delivery_company']
                    ? DeliveryCompany::where('name', $row['delivery_company'])->first()
                    : null;

                Order::create([
                    'tracking' => $row['tracking'],
                    'external_id' => $row['external_id'],
                    'client_name' => $row['client_name'],
                    'client_lastname' => $row['client_lastname'],
                    'phone' => $row['phone'],
                    'product_url' => $row['product_url'],
                    'status_id' => $status->id,
                    'created_by' => $authUserId,
                    'affected_to' => $affectedTo ? $affectedTo->id : null,
                    'delivery_company_id' => $deliveryCompany ? $deliveryCompany->id : null,
                    'archived' => isset($row['archived']) ? (int) $row['archived'] : 0, // Default to 0
                    'created_at' => isset($row['created_at']) && is_numeric($row['created_at'])
                    ? Date::excelToDateTimeObject($row['created_at'])->format('Y-m-d H:i:s')
                    : (is_string($row['created_at']) ? $row['created_at'] : now()->format('Y-m-d H:i:s')),
                ]);

                // Log::info('Order created successfully for row:', $row->toArray());
            } catch (\Exception $e) {
                $this->errors[] = [
                    'row' => $index + 2,
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

    private function isRowEmpty(Collection $row): bool
    {
        // Check if all values in the row are empty
        return $row->every(function ($value) {
            return empty($value);
        });
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
