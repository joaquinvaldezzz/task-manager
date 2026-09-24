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
            fn (Assert $page) => $page
                ->component('dashboard/index')
                ->has('tasks', 3)
                ->where('tasks.0.id', $task3->id)
                ->where('tasks.1.id', $task2->id)
                ->where('tasks.2.id', $task1->id),
        );
});

test('unverified users cannot create tasks', function () {
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)
        ->post(route('tasks.store'), [
            'title' => 'Test Task',
        ])
        ->assertRedirect(route('verification.notice'));
});

test('authenticated user can create a task', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->from(route('dashboard'))
        ->post(route('tasks.store'), [
            'title' => 'New Task',
            'description' => 'Task description',
        ]);

    $response->assertRedirect(route('dashboard'));

    $this->assertDatabaseHas('tasks', [
        'user_id' => $user->id,
        'title' => 'New Task',
        'description' => 'Task description',
        'completed' => false,
    ]);
});

test('task creation requires title', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->post(route('tasks.store'), [
            'title' => '',
        ]);

    $response->assertSessionHasErrors('title');
});

test('task title cannot exceed 255 characters', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->post(route('tasks.store'), [
            'title' => str_repeat('a', 256),
        ]);

    $response->assertSessionHasErrors('title');
});

test('guests cannot create tasks', function () {
    $this->post(route('tasks.store'), [
        'title' => 'Guest Task',
    ])->assertRedirect(route('login'));
});

test('user can update their own task', function () {
    $user = User::factory()->create();
    $task = Task::factory()->create([
        'user_id' => $user->id,
        'title' => 'Original Title',
        'description' => 'Original Description',
        'completed' => false,
    ]);

    $response = $this->actingAs($user)
        ->from(route('dashboard'))
        ->put(route('tasks.update', $task), [
            'title' => 'Updated Title',
            'description' => 'Updated Description',
            'completed' => true,
        ]);

    $response->assertRedirect(route('dashboard'));

    $this->assertDatabaseHas('tasks', [
        'id' => $task->id,
        'user_id' => $user->id,
        'title' => 'Updated Title',
        'description' => 'Updated Description',
        'completed' => true,
    ]);
});

test('user cannot update another user task', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();
    $task = Task::factory()->create([
        'user_id' => $userA->id,
        'title' => 'Original Title',
    ]);

    $response = $this->actingAs($userB)
        ->put(route('tasks.update', $task), [
            'title' => 'Hacked Title',
        ]);

    $response->assertForbidden();

    $this->assertDatabaseHas('tasks', [
        'id' => $task->id,
        'title' => 'Original Title',
    ]);
});

test('task update validation requires title when present', function () {
    $user = User::factory()->create();
    $task = Task::factory()->create([
        'user_id' => $user->id,
    ]);

    $response = $this->actingAs($user)
        ->put(route('tasks.update', $task), [
            'title' => '',
        ]);

    $response->assertSessionHasErrors('title');
});

test('user can delete their own task', function () {
    $user = User::factory()->create();
    $task = Task::factory()->create([
        'user_id' => $user->id,
    ]);

    $response = $this->actingAs($user)
        ->from(route('dashboard'))
        ->delete(route('tasks.destroy', $task));

    $response->assertRedirect(route('dashboard'));

    $this->assertModelMissing($task);
});

test('user cannot delete another user task', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();
    $task = Task::factory()->create([
        'user_id' => $userA->id,
    ]);

    $response = $this->actingAs($userB)
        ->delete(route('tasks.destroy', $task));

    $response->assertForbidden();

    $this->assertModelExists($task);
});
