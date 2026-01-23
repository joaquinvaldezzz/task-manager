import { useState } from "react";
import { useForm } from "@inertiajs/react";

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
import { toastManager } from "@/components/ui/toast";

import type { FormEvent } from "react";
import type { Task } from "@/types/task";

import { DiscardChangesDialog } from "./discard-changes-dialog";

interface TaskEditDialogProps {
  task: Task;
}

export function TaskEditDialog({ task }: TaskEditDialogProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState<boolean>(false);

  const { data, setData, put, processing, errors } = useForm({
    title: task.title,
    description: task.description ?? "",
  });

  const hasChanges = task.title !== data.title || (task.description ?? "") !== data.description;

  const handleReset = () => {
    setData({
      title: task.title,
      description: task.description ?? "",
    });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();

    put(`/tasks/${task.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        toastManager.add({
          title: "Task updated successfully!",
          type: "success",
        });
        setIsEditDialogOpen(false);
      },
      onError: () => {
        toastManager.add({
          title: "Failed to update task",
          type: "error",
        });
      },
    });
  };

  return (
    <Dialog
      open={isEditDialogOpen}
      onOpenChange={(event) => {
        if (!event && hasChanges) {
          setIsDiscardConfirmOpen(true);
        } else {
          setIsEditDialogOpen(event);
        }
      }}
    >
      <DialogTrigger className="hover:underline">{task.title}</DialogTrigger>
      <DialogPopup>
        <Form className="gap-0" onSubmit={submit} errors={errors}>
          <DialogHeader>
            <DialogTitle>Edit task #{task.id}</DialogTitle>
            <DialogDescription>Make changes here and click save.</DialogDescription>
          </DialogHeader>

          <DialogPanel className="flex flex-col gap-4">
            <Field name="title">
              <FieldLabel>Task</FieldLabel>
              <Input value={data.title} onChange={(e) => setData("title", e.target.value)} />
              {errors.title ? <FieldError>{errors.title}</FieldError> : null}
            </Field>

            <Field name="description">
              <FieldLabel>Description</FieldLabel>
              <Textarea
                value={data.description}
                onChange={(e) => setData("description", e.target.value)}
              />
              {errors.description ? <FieldError>{errors.description}</FieldError> : null}
            </Field>
          </DialogPanel>

          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
            <Button type="submit" disabled={processing || !hasChanges}>
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
          handleReset();
        }}
      />
    </Dialog>
  );
}
