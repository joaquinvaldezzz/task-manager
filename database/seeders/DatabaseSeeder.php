<?php

namespace Database\Seeders;

use App\Models\Task;
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
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Active high priority task due today
        Task::factory()->for($user)->highPriority()->dueToday()->create([
            'title' => 'Submit quarterly budget proposal',
            'description' => 'Finalize department headcount and cloud infrastructure estimates.',
        ]);

        // Active medium priority task due in 3 days
        Task::factory()->for($user)->mediumPriority()->create([
            'title' => 'Review pull requests for authentication sprint',
            'description' => 'Check Fortify two-factor flow and session expiration tests.',
            'completed' => false,
            'deadline' => now()->addDays(3)->toDateString(),
        ]);

        // Active low priority task with no deadline
        Task::factory()->for($user)->lowPriority()->incomplete()->create([
            'title' => 'Update developer onboarding documentation',
            'description' => 'Add notes on running Inertia SSR and local SQLite setup.',
            'deadline' => null,
        ]);

        // Overdue task
        Task::factory()->for($user)->highPriority()->overdue()->create([
            'title' => 'Renew domain SSL certificates',
            'description' => 'Ensure automated certbot renewals are operational.',
        ]);

        // Completed tasks
        Task::factory()->for($user)->completed()->mediumPriority()->create([
            'title' => 'Install Tailwind CSS v4 and React 19',
            'description' => 'Completed frontend stack upgrade.',
            'deadline' => now()->subDay()->toDateString(),
        ]);

        Task::factory()->for($user)->completed()->lowPriority()->create([
            'title' => 'Organize desktop folders and archives',
            'description' => 'Cleaned up project scratch directories.',
            'deadline' => null,
        ]);
    }
}
