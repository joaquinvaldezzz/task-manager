import { toastManager } from "@/components/ui/toast";

export function useTaskNotifications() {
  const notifyTaskCreated = () => {
    toastManager.add({
      title: "Task successfully added!",
      type: "success",
    });
  };

  const notifyTaskUpdated = () => {
    toastManager.add({
      title: "Task updated successfully!",
      type: "success",
    });
  };

  const notifyUpdateFailed = () => {
    toastManager.add({
      title: "Failed to update task",
      type: "error",
    });
  };

  const notifyTaskDeleted = () => {
    toastManager.add({
      title: "Task successfully deleted!",
      type: "success",
      description: "The task has been removed.",
    });
  };

  const notifyTaskToggled = (completed: boolean) => {
    toastManager.add({
      title: "Task status updated!",
      type: "success",
      description: completed ? "Task marked as completed." : "Task marked as incomplete.",
    });
  };

  return {
    notifyTaskCreated,
    notifyTaskUpdated,
    notifyUpdateFailed,
    notifyTaskDeleted,
    notifyTaskToggled,
  };
}
