import { useForm } from "@inertiajs/react";

import type { Task, TaskFormData } from "@/types/task";

interface UseTaskFormOptions {
  initialTitle?: string;
  initialDescription?: string;
}

export function useTaskForm(options?: UseTaskFormOptions) {
  const { data, setData, submit, processing, errors, reset, isDirty } = useForm<TaskFormData>({
    title: options?.initialTitle ?? "",
    description: options?.initialDescription ?? "",
  });

  return { data, setData, submit, processing, errors, reset, isDirty };
}
