import { Check as CheckIcon } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function TaskTableEmpty() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CheckIcon />
        </EmptyMedia>
        <EmptyTitle>No tasks found</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any tasks yet. Start by adding a new task to manage your to-dos.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
