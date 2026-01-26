import { useForm } from "@inertiajs/react";

import type { TaskFormData } from "@/types/task";

export function useTaskForm() {
  const { data, setData, submit, processing, errors, reset, isDirty } = useForm<TaskFormData>({
    title: "",
    description: "",
  });

  return { data, setData, submit, processing, errors, reset, isDirty };
}
