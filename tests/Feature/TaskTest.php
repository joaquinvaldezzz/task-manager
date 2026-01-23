<?php

use App\Models\Task;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('dashboard displays tasks', function () {
    $user = User::factory()->create();

    $task1 = Task::factory()->create([
        'user_id' => $user->id,
        'created_at' => now()->subMinutes(10),
    ]);
    $task2 = Task::factory()->create([
        'user_id' => $user->id,
        'created_at' => now()->subMinutes(5),
    ]);
    $task3 = Task::factory()->create(['user_id' => $user->id, 'created_at' => now()]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(
            fn(Assert $page) => $page
                ->component('dashboard/index')
                ->has('tasks', 3)
                ->where('tasks.0.id', $task3->id)
                ->where('tasks.1.id', $task2->id)
                ->where('tasks.2.id', $task1->id),
        );
});
