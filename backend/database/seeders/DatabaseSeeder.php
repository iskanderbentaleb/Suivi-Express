<?php

namespace Database\Seeders;

use App\Models\Agent;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'admin@gmail.com',
        //     'password' => 'admin@gmail.com'
        // ]);

        // Agent::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'agent@gmail.com',
        //     'password' => 'agent@gmail.com'
        // ]);
        Agent::factory(50)->create();

    }
}
