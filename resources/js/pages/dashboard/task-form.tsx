import { useForm } from "@inertiajs/react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toastManager } from "@/components/ui/toast";

import type { FormEvent } from "react";

export function TaskForm() {
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

  return (
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
  );
}
