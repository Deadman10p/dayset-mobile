export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type ActivityCategory =
  | 'deep-work'
  | 'meetings'
  | 'admin'
  | 'learning'
  | 'health'
  | 'personal'
  | 'break';

export interface CategoryInfo {
  id: ActivityCategory;
  label: string;
  color: string;
  emoji: string;
}

export interface Todo {
  id: string;
  title: string;
  priority: Priority;
  due_at: string | null; // ISO string
  tags: string[];
  status: 'open' | 'done' | 'snoozed';
  completed_at?: string | null;
  notes?: string;
  category?: ActivityCategory;
  created_at: string;
}

export interface Activity {
  id: string;
  title: string;
  category: ActivityCategory;
  duration_min: number;
  started_at: string; // ISO string
  ended_at?: string | null; // ISO string, null if running
  notes?: string;
}

export interface Reminder {
  id: string;
  title: string;
  remind_at: string; // ISO string
  status: 'pending' | 'completed' | 'dismissed';
  created_at: string;
}

export interface JournalEntry {
  date: string; // YYYY-MM-DD
  energy: number; // 1 to 5
  notes: string;
  highlights: string[];
}

export interface LogEvent {
  id: string;
  action: string;
  summary: string;
  actor: 'user' | 'agent' | 'system';
  created_at: string;
}

export interface UserSettings {
  userName: string;
  email: string;
  openaiKey?: string;
  anthropicKey?: string;
  elevenlabsKey?: string;
  mcpToken: string;
  voiceVoice: string;
  theme: 'emerald' | 'amber' | 'cyan' | 'monochrome';
  isDemoUser: boolean;
}

export interface ParsedInput {
  kind: 'todo' | 'reminder' | 'log' | 'start';
  title: string;
  priority?: Priority;
  tags: string[];
  durationMin?: number;
  category?: ActivityCategory;
  dueAt?: Date | null;
}
