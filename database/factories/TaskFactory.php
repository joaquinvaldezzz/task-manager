<?php

namespace Database\Factories;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Task>
 */
class TaskFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'completed' => $this->faker->boolean(),
            'priority' => 'medium',
            'deadline' => $this->faker->optional()->date(),
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'completed' => true,
        ]);
    }

    public function incomplete(): static
    {
        return $this->state(fn (array $attributes) => [
            'completed' => false,
        ]);
    }

    public function highPriority(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => 'high',
        ]);
    }

    public function mediumPriority(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => 'medium',
        ]);
    }

    public function lowPriority(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => 'low',
        ]);
    }

    public function overdue(): static
    {
        return $this->state(fn (array $attributes) => [
            'completed' => false,
            'deadline' => now()->subDays(3)->toDateString(),
        ]);
    }

    public function dueToday(): static
    {
        return $this->state(fn (array $attributes) => [
            'completed' => false,
            'deadline' => now()->toDateString(),
        ]);
    }
}
