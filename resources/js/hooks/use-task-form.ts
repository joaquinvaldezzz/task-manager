import { useForm } from "@inertiajs/react";

import type { TaskFormData, TaskPriority } from "@/types/task";

interface UseTaskFormOptions {
  initialTitle?: string;
  initialDescription?: string;
  initialDeadline?: string | null;
  initialPriority?: TaskPriority;
}

export function useTaskForm(options?: UseTaskFormOptions) {
  const { data, setData, submit, processing, errors, reset, isDirty } = useForm<TaskFormData>({
    title: options?.initialTitle ?? "",
    description: options?.initialDescription ?? "",
    deadline: options?.initialDeadline ?? null,
    priority: options?.initialPriority ?? "medium",
  });

  return { data, setData, submit, processing, errors, reset, isDirty };
}
