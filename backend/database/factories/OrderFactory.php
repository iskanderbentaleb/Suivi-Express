<?php

namespace Database\Factories;

use App\Models\Agent;
use App\Models\DeliveryCompany;
use App\Models\StatusOrder;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tracking' => $this->faker->unique()->uuid,
            'external_id' => $this->faker->unique()->uuid,
            'client_name' => $this->faker->firstName,
            'client_lastname' => $this->faker->lastName,
            'phone' => $this->faker->phoneNumber,
            'created_by' => User::inRandomOrder()->first()->id, // Automatically create a user
            'affected_to' => Agent::inRandomOrder()->first()->id, // Automatically create an agent
            'status_id' => StatusOrder::inRandomOrder()->first()->id ,
            'delivery_company_id' => DeliveryCompany::inRandomOrder()->first()->id ,
            'product_url' => $this->faker->url,
        ];
    }
}
