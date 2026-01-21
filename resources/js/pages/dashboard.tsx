import { Head, router, useForm } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toastManager } from "@/components/ui/toast";

import type { FormEvent } from "react";

interface DashboardProps {
  tasks: {
    id: number;
    title: string;
    description?: string;
    completed: boolean;
    created_at: string;
    updated_at: string;
  }[];
}

export default function Dashboard({ tasks }: DashboardProps) {
  const { data, setData, post, processing, errors, reset } = useForm({
    title: "",
    description: "",
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    post("/tasks", {
      onSuccess: () => {
        toastManager.add({
          title: "Task successfully added!",
        });
        reset();
      },
    });
  };

  const toggleTask = (taskId: number, completed: boolean) => {
    router.put(
      `/tasks/${taskId}`,
      {
        completed,
      },
      {
        // preserveScroll: true,
        onSuccess: () => {
          toastManager.add({
            title: "Task status successfully updated!",
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
        });
      },
    });
  };

  return (
    <AppLayout>
      <Head title="Dashboard" />

      <div className="mx-auto max-w-prose p-4">
        <Card>
          <CardHeader>
            <CardTitle>Create a new task</CardTitle>
            <CardDescription>Create one by completing this form.</CardDescription>
          </CardHeader>
          <CardPanel>
            <Form onSubmit={submit} errors={errors}>
              <Field name="title" disabled={processing}>
                <FieldLabel>Task</FieldLabel>
                <Input
                  type="text"
                  value={data.title}
                  onChange={(event) => setData("title", event.target.value)}
                />
                {errors.title ? <FieldError>{errors.title}</FieldError> : null}
              </Field>

              <Field name="description" disabled={processing}>
                <FieldLabel>Description (optional)</FieldLabel>
                <Textarea
                  value={data.description}
                  onChange={(e) => setData("description", e.target.value)}
                />
              </Field>

              <Button type="submit" disabled={processing}>
                Add Task
              </Button>
            </Form>
          </CardPanel>
        </Card>

        <ul className="mt-8 space-y-3">
          {tasks.map((task) => (
            <li className="flex items-center justify-between" key={task.id}>
              <div className="flex items-start gap-2">
                <Checkbox
                  className="mt-0.5"
                  id={task.id.toString()}
                  checked={task.completed}
                  onCheckedChange={(checked) => toggleTask(task.id, Boolean(checked))}
                />
                <div className="flex flex-col gap-1">
                  <div className="flex gap-2">
                    <Label htmlFor={task.id.toString()}>{task.title}</Label>
                    <p className="text-sm">
                      {new Date(task.created_at).toLocaleString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        // hour12: false,
                      })}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">{task.description}</p>
                </div>
              </div>

              <Button variant="destructive-outline" size="icon" onClick={() => deleteTask(task.id)}>
                <Trash />
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </AppLayout>
  );
}
