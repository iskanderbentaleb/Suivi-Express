<?php

namespace App\Exports;

use App\Models\Order;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Illuminate\Support\Facades\Auth;

class OrdersExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    /**
     * Fetch all orders to export.
     */
    public function collection()
    {
        $query = Order::with(['status', 'createdBy', 'affectedTo', 'deliveryCompany']);

        if (Auth::guard('agent')->check()) {
            // The authenticated user is an agent
            $query->where('affected_to', Auth::guard('agent')->id());
        }
        return $query->get();
    }




    /**
     * Define the headers for the Excel file.
     */
    public function headings(): array
    {
        return [
            'ID',
            'Tracking',
            'External ID',
            'Client Name',
            'Client Lastname',
            'Phone',
            'Product URL',
            'Status',
            'Created By',
            'Affected To',
            'Delivery Company',
            'Created At',
            'Updated At',
        ];
    }

    /**
     * Map the data for each row in the Excel file.
     */
    public function map($order): array
    {
        return [
            $order->id,
            $order->tracking,
            $order->external_id,
            $order->client_name,
            $order->client_lastname,
            $order->phone,
            $order->product_url,
            $order->status ? $order->status->status : 'N/A', // Flatten status
            $order->createdBy ? $order->createdBy->name : 'N/A', // Flatten created_by
            $order->affectedTo ? $order->affectedTo->name : 'N/A', // Flatten affected_to
            $order->deliveryCompany ? $order->deliveryCompany->name : 'N/A', // Flatten delivery_company
            $order->created_at,
            $order->updated_at,
        ];
    }

    /**
     * Apply styles to the Excel file.
     */
    public function styles(Worksheet $sheet)
    {
        // Apply styles to the header row
        $sheet->getStyle('A1:M1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'name' => 'Aptos Narrow',
                'size' => 12,
            ],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => '262626'], // Black background
            ],
            'alignment' => [
                'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
            ],
        ]);

        // Set row height for the header row
        $sheet->getRowDimension(1)->setRowHeight(25);

        // Set column widths
        $sheet->getColumnDimension('A')->setWidth(10); // ID
        $sheet->getColumnDimension('B')->setWidth(20); // Tracking
        $sheet->getColumnDimension('C')->setWidth(20); // External ID
        $sheet->getColumnDimension('D')->setWidth(20); // Client Name
        $sheet->getColumnDimension('E')->setWidth(20); // Client Lastname
        $sheet->getColumnDimension('F')->setWidth(20); // Phone
        $sheet->getColumnDimension('G')->setWidth(30); // Product URL
        $sheet->getColumnDimension('H')->setWidth(20); // Status
        $sheet->getColumnDimension('I')->setWidth(20); // Created By
        $sheet->getColumnDimension('J')->setWidth(20); // Affected To
        $sheet->getColumnDimension('K')->setWidth(20); // Delivery Company
        $sheet->getColumnDimension('L')->setWidth(20); // Created At
        $sheet->getColumnDimension('M')->setWidth(20); // Updated At
    }
}
