<?php

namespace Database\Seeders;

use App\Models\MailStatus;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MailStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            ['status' => 'En attente de réponse'],
            ['status' => 'Succès'],
            ['status' => 'Échec'],
            ['status' => 'Rejeté'],
            ['status' => 'Annulé'],
        ];

        MailStatus::insert($statuses);
    }


}
