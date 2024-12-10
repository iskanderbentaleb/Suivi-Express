<?php

namespace Database\Seeders;

use App\Models\DeliveryCompany;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DeliveryCompanySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $companies = [
            ['name' => 'Yalidine', 'colorHex' => '#dc3545'],
            ['name' => 'Maystro Delivery', 'colorHex' => '#008aff'],
            ['name' => 'Zr express', 'colorHex' => '#EDB230']
        ];

        DeliveryCompany::insert($companies);
    }
}
