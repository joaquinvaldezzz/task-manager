import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { useTaskForm } from "@/hooks/use-task-form";
import { useTaskOperations } from "@/hooks/use-task-operations";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import type { Task, TaskPriority } from "@/types/task";

import { DiscardChangesDialog } from "./discard-changes-dialog";

const priorityItems = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

interface TaskEditDialogProps {
  task: Task;
}

export function TaskEditDialog({ task }: TaskEditDialogProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState<boolean>(false);
  const { data, setData, submit, processing, errors, reset, isDirty } = useTaskForm({
    initialTitle: task.title,
    initialDescription: task.description,
    initialDeadline: task.deadline,
    initialPriority: task.priority,
  });
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
              <Input value={data.title} onChange={(e) => setData("title", e.target.value)} />
              {errors.title ? <FieldError>{errors.title}</FieldError> : null}
            </Field>

            <Field name="description">
              <FieldLabel>Description</FieldLabel>
              <Textarea
                value={data.description ?? ""}
                onChange={(e) => setData("description", e.target.value)}
              />
              {errors.description ? <FieldError>{errors.description}</FieldError> : null}
            </Field>

            <Field name="priority" disabled={processing}>
              <FieldLabel>Priority</FieldLabel>
              <Select
                items={priorityItems}
                value={data.priority ?? "medium"}
                onValueChange={(val) => {
                  if (val) setData("priority", val as TaskPriority);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority ? <FieldError>{errors.priority}</FieldError> : null}
            </Field>

            <Field name="deadline" disabled={processing}>
              <FieldLabel>Due date (optional)</FieldLabel>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    />
                  }
                >
                  <CalendarIcon />
                  {data.deadline ? (
                    format(parseISO(data.deadline), "PPP")
                  ) : (
                    <span className="text-muted-foreground">Pick a date</span>
                  )}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={data.deadline ? parseISO(data.deadline) : undefined}
                    onSelect={(date) =>
                      setData("deadline", date ? format(date, "yyyy-MM-dd") : null)
                    }
                  />
                </PopoverContent>
              </Popover>
              {errors.deadline ? <FieldError>{errors.deadline}</FieldError> : null}
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
