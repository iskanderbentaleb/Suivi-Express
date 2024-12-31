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
            ['status' => 'Vers Wilaya/Transfert', 'colorHex' => '#2196F3'], // Green
            ['status' => 'Centre', 'colorHex' => '#4c889c'], // Green
            ['status' => 'En attente du client', 'colorHex' => '#FF9800'], // Blue
            ['status' => 'Tentative échouée', 'colorHex' => '#FFC107'], // Yellow
            ['status' => 'Livré', 'colorHex' => '#4CAF50'], // Green
            ['status' => 'Sorti en livraison', 'colorHex' => '#03A9F4'], // Blue
            ['status' => 'Retard', 'colorHex' => '#FF5722'], // Orange
            ['status' => 'Échec livraison', 'colorHex' => '#F44336'], // Red
            ['status' => 'Retourné vers vendeur', 'colorHex' => '#F44336'], // red
            ['status' => 'Retourné au vendeur', 'colorHex' => '#FFC107'], // yellow
        ];
        StatusOrder::insert($statuses);
    }
}
