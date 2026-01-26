import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";

import type { Task } from "@/types/task";

import { TaskForm } from "./task-form";
import { TasksTable } from "./tasks-table";

interface DashboardProps {
  tasks: Task[];
}

export default function Dashboard({ tasks }: DashboardProps) {
  return (
    <AppLayout>
      <Head title="Dashboard" />

      <div className="mx-auto max-w-prose space-y-8 p-4">
        <TaskForm />
        <TasksTable tasks={tasks} />
      </div>
    </AppLayout>
  );
}
