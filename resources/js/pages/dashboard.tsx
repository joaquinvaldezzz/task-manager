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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toastManager } from "@/components/ui/toast";

import type { FormEvent } from "react";
import type { Task } from "@/types/task";

interface DashboardProps {
  tasks: Task[];
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
          type: "success",
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

  return (
    <AppLayout>
      <Head title="Dashboard" />

      <div className="mx-auto max-w-prose space-y-8 p-4">
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

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Done</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <Checkbox
                    id={task.id.toString()}
                    checked={task.completed}
                    onCheckedChange={(checked) => toggleTask(task.id, Boolean(checked))}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <Label htmlFor={task.id.toString()}>{task.title}</Label>
                </TableCell>
                <TableCell className="text-muted-foreground">{task.description ?? "-"}</TableCell>
                <TableCell className="text-sm text-muted-foreground tabular-nums">
                  {new Date(task.created_at).toLocaleString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    aria-label={`Delete task #${task.id}`}
                    variant="destructive-outline"
                    size="icon"
                    onClick={() => deleteTask(task.id)}
                  >
                    <Trash />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AppLayout>
  );
}
