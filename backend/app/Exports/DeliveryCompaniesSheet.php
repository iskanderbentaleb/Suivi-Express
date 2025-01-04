<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use App\Models\DeliveryCompany;

class DeliveryCompaniesSheet implements FromCollection, WithStyles, WithHeadings , WithTitle
{
    public function collection()
    {
        return DeliveryCompany::all();
    }

    public function headings(): array
    {
        return [
            'ID', // Header for column A
            'Name', // Header for column B
            'Color', // Header for column B
        ];
    }

    public function styles(Worksheet $sheet)
    {
        // Apply styles to the header row
        $sheet->getStyle('A1:C1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'name' => 'Aptos Narrow', // Set font to Aptos Narrow
                'size' => 12, // Optional: Set font size
            ],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => '262626'], // Black background
            ],
            'alignment' => [
                'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER, // Center vertically
            ],
        ]);

        // Set row height for the header row
        $sheet->getRowDimension(1)->setRowHeight(25); // Set height to 25

        // Set column widths
        $sheet->getColumnDimension('A')->setWidth(20);
        $sheet->getColumnDimension('B')->setWidth(20);
        $sheet->getColumnDimension('C')->setWidth(20);
    }

    public function title(): string
    {
        return 'All Delivery Companies'; // Sheet name
    }

}
