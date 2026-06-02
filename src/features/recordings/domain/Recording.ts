export interface Recording {
  id: string;
  filename: string;
  topic?: string;
  tags: string[];
  created: string;
  duration?: number;
}
