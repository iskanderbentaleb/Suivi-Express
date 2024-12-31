<?php

namespace App\Exports;

use App\Models\Order;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class OrdersExport implements FromCollection, WithHeadings, WithMapping
{
    /**
     * Fetch all orders to export.
     */
    public function collection()
    {
        return Order::with(['status', 'createdBy', 'affectedTo', 'deliveryCompany'])->get();
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
}
