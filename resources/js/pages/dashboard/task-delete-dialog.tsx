import { Trash } from "lucide-react";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface TaskDeleteDialogProps {
  taskId: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (taskId: number) => void;
}

export function TaskDeleteDialog({
  taskId,
  isOpen,
  onOpenChange,
  onDelete,
}: TaskDeleteDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogTrigger
        render={
          <Button
            aria-label={`Delete task #${taskId}`}
            variant="destructive-outline"
            size="icon"
            onClick={() => onOpenChange(true)}
          />
        }
      >
        <Trash />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete task</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this task? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="ghost" />}>Cancel</AlertDialogClose>
          <Button
            variant="destructive"
            onClick={() => {
              onDelete(taskId);
              onOpenChange(false);
            }}
          >
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
