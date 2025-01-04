<?php
namespace App\Exports;

use App\Models\Agent;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AgentsExport implements FromCollection, WithHeadings, WithStyles
{
    public function collection()
    {
        return Agent::withCount([
            'orders as livré_count' => function ($query) {
                $query->whereHas('status', function ($statusQuery) {
                    $statusQuery->where('status', 'Livré');
                });
            },
            'orders as retour_count' => function ($query) {
                $query->whereHas('status', function ($statusQuery) {
                    $statusQuery->where('status', 'Retourné au vendeur');
                });
            },
            'orders'
        ])->get()->map(function ($agent) {
            return [
                'id' => $agent->id,
                'name' => $agent->name,
                'email' => $agent->email,
                'livré_count' => $agent->livré_count ?? 0,
                'retour_count' => $agent->retour_count ?? 0,
                'orders_count' => $agent->orders_count ?? 0,
                'created_at' => $agent->created_at->format('Y-m-d H:i:s')
            ];
        });
    }

    public function headings(): array
    {
        return [
            'ID',
            'Name',
            'Email',
            'Livré Count',
            'Retour Count',
            'Total Orders Count',
            'Created At',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        // Apply styles to the header row
        $sheet->getStyle('A1:G1')->applyFromArray([
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
        $sheet->getColumnDimension('B')->setWidth(20); // Name
        $sheet->getColumnDimension('C')->setWidth(30); // Email
        $sheet->getColumnDimension('D')->setWidth(15); // Livré Count
        $sheet->getColumnDimension('E')->setWidth(15); // Retour Count
        $sheet->getColumnDimension('F')->setWidth(20); // Total Orders Count
        $sheet->getColumnDimension('G')->setWidth(20); // Created At
    }
}
