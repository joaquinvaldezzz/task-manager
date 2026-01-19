import { Head, useForm } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";

import type { BreadcrumbItem } from "@/types";
import type { FormEvent } from "react";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Dashboard",
    href: dashboard().url,
  },
];

interface DashboardProps {
  auth: {
    user: {
      id: number;
      name: string;
      email: string;
    };
  };
  tasks: {
    id: number;
    title: string;
    description?: string;
    completed: boolean;
  }[];
}

export default function Dashboard({ auth, tasks }: DashboardProps) {
  const { data, setData, post, processing, errors, reset } = useForm({
    title: "",
    description: "",
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    post("/tasks", {
      onSuccess: () => reset(),
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="mx-auto max-w-3xl p-6">
          <h1 className="mb-4 text-2xl font-bold">My Tasks</h1>

          {/* Task Form */}
          <form onSubmit={submit} className="mb-6 space-y-4">
            <div>
              <input
                type="text"
                className="w-full rounded border px-3 py-2"
                placeholder="Task title"
                value={data.title}
                onChange={(e) => setData("title", e.target.value)}
              />
              {errors.title ? (
                <div className="mt-1 text-sm text-red-500">{errors.title}</div>
              ) : null}
            </div>

            <div>
              <textarea
                className="w-full rounded border px-3 py-2"
                placeholder="Description (optional)"
                value={data.description}
                onChange={(e) => setData("description", e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={processing}
              className="rounded bg-blue-600 px-4 py-2 text-white"
            >
              Add Task
            </button>
          </form>

          {/* Task List */}
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center justify-between rounded border p-3">
                <div>
                  <p className={task.completed ? "text-gray-500 line-through" : ""}>{task.title}</p>
                  {task.description ? (
                    <p className="text-sm text-gray-600">{task.description}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}
