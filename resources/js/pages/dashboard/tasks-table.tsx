import { useState } from "react";
import { format, parseISO } from "date-fns";

import { useTaskOperations } from "@/hooks/use-task-operations";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs";

import type { badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import type { Task, TaskPriority } from "@/types/task";

import { TaskDeleteDialog } from "./task-delete-dialog";
import { TaskEditDialog } from "./task-edit-dialog";
import { TaskTableEmpty } from "./task-table-empty";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const priorityBadgeVariants: Record<TaskPriority, BadgeVariant> = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
};

interface TasksTableProps {
  tasks: Task[];
}

export function TasksTable({ tasks }: TasksTableProps) {
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);
  const { toggleTask, deleteTask } = useTaskOperations();

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        value={filter}
        onValueChange={(val) => setFilter(val as "all" | "active" | "completed")}
      >
        <TabsList>
          <TabsTab value="all">All</TabsTab>
          <TabsTab value="active">Active</TabsTab>
          <TabsTab value="completed">Completed</TabsTab>
        </TabsList>
      </Tabs>

      <Frame>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Done</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Modified</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
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

                  <TableCell>
                    {task.priority ? (
                      <Badge
                        variant={priorityBadgeVariants[task.priority] ?? "secondary"}
                        className="capitalize"
                      >
                        {task.priority}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>

                  <TableCell className="text-muted-foreground tabular-nums">
                    {task.deadline ? format(parseISO(task.deadline), "MMM d") : "—"}
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
                <TableCell colSpan={7}>
                  <TaskTableEmpty />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Frame>
    </div>
  );
}
