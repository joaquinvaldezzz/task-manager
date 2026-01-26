import { router } from "@inertiajs/react";

import { destroy, store, update } from "@/actions/App/Http/Controllers/TaskController";

import type { InertiaFormProps } from "@inertiajs/react";
import type { FormEvent } from "react";
import type { Task } from "@/types/task";

import { useTaskNotifications } from "./use-task-notifications";

export function useTaskOperations() {
  const {
    notifyTaskCreated,
    notifyTaskUpdated,
    notifyUpdateFailed,
    notifyTaskDeleted,
    notifyTaskToggled,
  } = useTaskNotifications();

  const createTask =
    (submit: InertiaFormProps<Task>["submit"], onSuccess: () => void, onReset: () => void) =>
    (e: FormEvent) => {
      e.preventDefault();

      submit(store(), {
        onSuccess: () => {
          notifyTaskCreated();
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
          notifyTaskToggled(completed);
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
          notifyTaskUpdated();
          onSuccess();
        },
        onError: () => {
          notifyUpdateFailed();
        },
      });
    };

  const deleteTask = (taskId: number) => {
    router.delete(destroy.url({ id: taskId }), {
      onSuccess: () => {
        notifyTaskDeleted();
      },
    });
  };

  return { createTask, toggleTask, updateTask, deleteTask };
}
