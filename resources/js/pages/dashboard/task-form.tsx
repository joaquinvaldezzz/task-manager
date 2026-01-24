import { useState } from "react";
import { useForm } from "@inertiajs/react";
import { Plus as PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useTaskOperations } from "./use-task-operations";

export function TaskForm() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const { data, setData, submit, processing, errors, reset } = useForm({
    title: "",
    description: "",
  });
  const { createTask } = useTaskOperations();

  const handleTaskSubmission = createTask(submit, () => setIsDialogOpen(false), reset);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon />
        <span>Add task</span>
      </DialogTrigger>

      <DialogPopup>
        <Form className="gap-0" onSubmit={handleTaskSubmission} errors={errors}>
          <DialogHeader>
            <DialogTitle>Create a new task</DialogTitle>
            <DialogDescription>Create one by completing this form.</DialogDescription>
          </DialogHeader>
          <DialogPanel className="flex flex-col gap-4">
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
          </DialogPanel>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
            <Button type="submit" disabled={processing}>
              Add Task
            </Button>
          </DialogFooter>
        </Form>
      </DialogPopup>
    </Dialog>
  );
}
