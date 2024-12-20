<?php

namespace Database\Seeders;

use App\Models\Reason;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ReasonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $reasons = [
            ['reason' => 'Téléphone injoignable'],
            ['reason' => 'Client ne répond pas'],
            ['reason' => 'Faux numéro'],
            ['reason' => 'Client absent (reporté)'],
            ['reason' => 'Client absent (échoué)'],
            ['reason' => 'Annulé par le client'],
            ['reason' => 'Commande double'],
            ['reason' => "Le client n'a pas commandé"],
            ['reason' => 'Produit erroné'],
            ['reason' => 'Produit manquant'],
            ['reason' => 'Produit cassé ou défectueux'],
            ['reason' => 'Client incapable de payer'],
            ['reason' => 'Wilaya erronée'],
            ['reason' => 'Commune erronée'],
        ];

        Reason::insert($reasons);
    }
}
