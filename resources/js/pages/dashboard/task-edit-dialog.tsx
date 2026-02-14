import { useState } from "react";

import { useTaskForm } from "@/hooks/use-task-form";
import { useTaskOperations } from "@/hooks/use-task-operations";
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

import type { Task } from "@/types/task";

import { DiscardChangesDialog } from "./discard-changes-dialog";

interface TaskEditDialogProps {
  task: Task;
}

export function TaskEditDialog({ task }: TaskEditDialogProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState<boolean>(false);
  const { data, setData, submit, processing, errors, reset, isDirty } = useTaskForm();
  const { updateTask } = useTaskOperations();

  const handleTaskUpdate = updateTask(task, submit, () => setIsEditDialogOpen(false));

  return (
    <Dialog
      open={isEditDialogOpen}
      onOpenChange={(event) => {
        if (!event && isDirty) {
          setIsDiscardConfirmOpen(true);
        } else {
          setIsEditDialogOpen(event);
        }
      }}
    >
      <DialogTrigger className="hover:underline">{task.title}</DialogTrigger>
      <DialogPopup>
        <Form className="gap-0" onSubmit={handleTaskUpdate} errors={errors}>
          <DialogHeader>
            <DialogTitle>Edit task #{task.id}</DialogTitle>
            <DialogDescription>Make changes here and click save.</DialogDescription>
          </DialogHeader>

          <DialogPanel className="flex flex-col gap-4">
            <Field name="title">
              <FieldLabel>Task</FieldLabel>
              <Input
                value={data.title || task.title}
                onChange={(e) => setData("title", e.target.value)}
              />
              {errors.title ? <FieldError>{errors.title}</FieldError> : null}
            </Field>

            <Field name="description">
              <FieldLabel>Description</FieldLabel>
              <Textarea
                value={(data.description || task.description) ?? ""}
                onChange={(e) => setData("description", e.target.value)}
              />
              {errors.description ? <FieldError>{errors.description}</FieldError> : null}
            </Field>
          </DialogPanel>

          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
            <Button type="submit" disabled={processing || !isDirty}>
              Save
            </Button>
          </DialogFooter>
        </Form>
      </DialogPopup>

      <DiscardChangesDialog
        open={isDiscardConfirmOpen}
        onOpenChange={setIsDiscardConfirmOpen}
        onDiscard={() => {
          setIsDiscardConfirmOpen(false);
          setIsEditDialogOpen(false);
          reset();
        }}
      />
    </Dialog>
  );
}
