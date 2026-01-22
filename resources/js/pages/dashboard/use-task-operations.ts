import { router } from "@inertiajs/react";

import { toastManager } from "@/components/ui/toast";

export function useTaskOperations() {
  const toggleTask = (taskId: number, completed: boolean) => {
    router.put(
      `/tasks/${taskId}`,
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

  const deleteTask = (taskId: number) => {
    router.delete(`/tasks/${taskId}`, {
      onSuccess: () => {
        toastManager.add({
          title: "Task successfully deleted!",
          type: "success",
          description: "The task has been removed.",
        });
      },
    });
  };

  return { toggleTask, deleteTask };
}
