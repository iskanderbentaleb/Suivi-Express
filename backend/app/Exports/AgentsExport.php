<?php
namespace App\Exports;

use App\Models\Agent;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class AgentsExport implements FromCollection, WithHeadings
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
}
