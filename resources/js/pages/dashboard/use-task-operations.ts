import { router } from "@inertiajs/react";

import { destroy, store, update } from "@/actions/App/Http/Controllers/TaskController";
import { toastManager } from "@/components/ui/toast";

import type { InertiaFormProps } from "@inertiajs/react";
import type { FormEvent } from "react";
import type { Task } from "@/types/task";

export function useTaskOperations() {
  const createTask =
    (submit: InertiaFormProps<Task>["submit"], onSuccess: () => void, onReset: () => void) =>
    (e: FormEvent) => {
      e.preventDefault();

      submit(store(), {
        onSuccess: () => {
          toastManager.add({
            title: "Task successfully added!",
            type: "success",
          });
          onSuccess();
          onReset();
        },
      });
    };

  const toggleTask = (taskId: number, completed: boolean) => {
    router.put(
      update.url({ id: taskId }),
      { completed },
      {
        onSuccess: () => {
          toastManager.add({
            title: "Task status updated!",
            type: "success",
            description: completed ? "Task marked as completed." : "Task marked as incomplete.",
          });
        },
      },
    );
  };

  const updateTask =
    (task: Task, submit: InertiaFormProps<Task>["submit"], onSuccess: () => void) =>
    (e: FormEvent) => {
      e.preventDefault();

      submit(update(task), {
        preserveScroll: true,
        onSuccess: () => {
          toastManager.add({
            title: "Task updated successfully!",
            type: "success",
          });
          onSuccess();
        },
        onError: () => {
          toastManager.add({
            title: "Failed to update task",
            type: "error",
          });
        },
      });
    };

  const deleteTask = (taskId: number) => {
    router.delete(destroy.url({ id: taskId }), {
      onSuccess: () => {
        toastManager.add({
          title: "Task successfully deleted!",
          type: "success",
          description: "The task has been removed.",
        });
      },
    });
  };

  return { createTask, toggleTask, updateTask, deleteTask };
}
