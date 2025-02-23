<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ReadMeSheet implements FromArray, WithStyles , WithTitle
{
    public function array(): array
    {
        return [
            ['Archivage des commandes', 'Date de création'],
            ['Si vous souhaitez archiver une commande, écrivez simplement : true',
             'Le champ "created_at" peut être vide, mais vous pouvez aussi y mettre une date pour vos anciennes commandes.'],
        ];
    }

    public function styles(Worksheet $sheet)
    {
        // Apply styles to header row
        $sheet->getStyle('A1:B1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 12,
            ],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => '262626'], // Dark background
            ],
            'alignment' => [
                'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
            ],
        ]);

        // Apply styles to content row
        $sheet->getStyle('A2:B2')->applyFromArray([
            'font' => [
                'size' => 11,
            ],
            'alignment' => [
                'wrapText' => true, // Wrap long text
                'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_TOP,
            ],
        ]);

        // Set column widths
        $sheet->getColumnDimension('A')->setWidth(40);
        $sheet->getColumnDimension('B')->setWidth(60);

        // Set row heights
        $sheet->getRowDimension(1)->setRowHeight(25);
        $sheet->getRowDimension(2)->setRowHeight(40);
    }

    public function title(): string
    {
        return 'ReadMe'; // Sheet name
    }
}
