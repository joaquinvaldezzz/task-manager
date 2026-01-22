import { Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Task } from "@/types/task";

import { formatDate } from "./utils";

interface TasksTableProps {
  tasks: Task[];
  onToggle: (taskId: number, completed: boolean) => void;
  onDelete: (taskId: number) => void;
}

export function TasksTable({ tasks, onToggle, onDelete }: TasksTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
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
              <span className="text-muted-foreground tabular-nums">#{task.id}</span>
            </TableCell>
            <TableCell>
              <Checkbox
                id={task.id.toString()}
                checked={task.completed}
                onCheckedChange={(checked) => onToggle(task.id, Boolean(checked))}
              />
            </TableCell>
            <TableCell>
              <Label htmlFor={task.id.toString()}>{task.title}</Label>
            </TableCell>
            <TableCell className="text-muted-foreground">{task.description ?? "-"}</TableCell>
            <TableCell className="text-muted-foreground tabular-nums">
              {formatDate(task.created_at)}
            </TableCell>
            <TableCell className="text-right">
              <Button
                aria-label={`Delete task #${task.id}`}
                variant="destructive-outline"
                size="icon"
                onClick={() => onDelete(task.id)}
              >
                <Trash />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
