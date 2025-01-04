<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class TemplateExport implements WithMultipleSheets
{
    public function sheets(): array
    {
        return [
            'Template' => new TemplateSheet(),
            'All Status' => new StatusSheet(),
            'All Agents' => new AgentsSheet(),
            'All Delivery Companies' => new DeliveryCompaniesSheet(),
        ];
    }
}
