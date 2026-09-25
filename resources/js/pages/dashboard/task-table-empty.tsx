import { Check as CheckIcon } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export type TaskFilterType = "all" | "active" | "completed";

interface TaskTableEmptyProps {
  filter?: TaskFilterType;
  totalTasks?: number;
}

const emptyStateContent = {
  none: {
    title: "No tasks found",
    description:
      "You haven't created any tasks yet. Start by adding a new task to manage your to-dos.",
  },
  active: {
    title: "All caught up!",
    description: "You don't have any active tasks right now. Great job!",
  },
  completed: {
    title: "No completed tasks yet",
    description: "Completed tasks will appear here as you check them off.",
  },
  filteredEmpty: {
    title: "No matching tasks",
    description: "No tasks match the selected filter.",
  },
};

export function TaskTableEmpty({ filter = "all", totalTasks = 0 }: TaskTableEmptyProps) {
  let content = emptyStateContent.none;

  if (totalTasks > 0) {
    if (filter === "active") {
      content = emptyStateContent.active;
    } else if (filter === "completed") {
      content = emptyStateContent.completed;
    } else {
      content = emptyStateContent.filteredEmpty;
    }
  }

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CheckIcon />
        </EmptyMedia>
        <EmptyTitle>{content.title}</EmptyTitle>
        <EmptyDescription>{content.description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
