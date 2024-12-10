<?php

namespace Database\Seeders;

use App\Models\StatusOrder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StatusOrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            ['status' => 'En préparation', 'colorHex' => '#4CAF50'], // Green
            ['status' => 'Vers Wilaya/Transfert', 'colorHex' => '#4CAF50'], // Green
            ['status' => 'Centre', 'colorHex' => '#4CAF50'], // Green
            ['status' => 'En attente du client', 'colorHex' => '#2196F3'], // Blue
            ['status' => 'Tentative échouée', 'colorHex' => '#FFD700'], // Yellow
            ['status' => 'Livré', 'colorHex' => '#4CAF50'], // Green
            ['status' => 'Sorti en livraison', 'colorHex' => '#2196F3'], // Blue
            ['status' => 'Retard', 'colorHex' => '#FF5722'], // Orange
            ['status' => 'Échec livraison', 'colorHex' => '#F44336'], // Red
        ];

        StatusOrder::insert($statuses);
    }
}
