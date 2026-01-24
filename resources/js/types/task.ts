export interface Task {
  id: number;
  title: string;
  description?: string;
  deadline?: string;
  priority?: "low" | "medium" | "high";
  labels?: string[];
  completed: boolean;
  created_at: string;
  updated_at: string;
}
