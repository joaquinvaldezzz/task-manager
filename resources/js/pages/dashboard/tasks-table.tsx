import { useState } from "react";
import { format } from "date-fns";

import { useTaskOperations } from "@/hooks/use-task-operations";
import { Checkbox } from "@/components/ui/checkbox";
import { Frame } from "@/components/ui/frame";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Task } from "@/types/task";

import { TaskDeleteDialog } from "./task-delete-dialog";
import { TaskEditDialog } from "./task-edit-dialog";
import { TaskTableEmpty } from "./task-table-empty";

interface TasksTableProps {
  tasks: Task[];
}

export function TasksTable({ tasks }: TasksTableProps) {
  const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);
  const { toggleTask, deleteTask } = useTaskOperations();

  return (
    <Frame>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Done</TableHead>
            <TableHead>Task</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Modified</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <Checkbox
                    id={task.id.toString()}
                    checked={task.completed}
                    onCheckedChange={(checked) => toggleTask(task.id, Boolean(checked))}
                  />
                </TableCell>

                <TableCell>
                  <TaskEditDialog task={task} />
                </TableCell>

                <TableCell className="text-muted-foreground tabular-nums">
                  {format(task.created_at, "MMM d")}
                </TableCell>

                <TableCell className="text-muted-foreground tabular-nums">
                  {format(task.updated_at, "MMM d")}
                </TableCell>

                <TableCell className="text-right">
                  <TaskDeleteDialog
                    taskId={task.id}
                    isOpen={deleteTaskId === task.id}
                    onOpenChange={(open) => setDeleteTaskId(open ? task.id : null)}
                    onDelete={deleteTask}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5}>
                <TaskTableEmpty />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Frame>
  );
}
