import { ActivityCategory, CategoryInfo, Priority, Todo, Activity, Reminder } from '../types';

export const THEME = {
  colors: {
    bg: '#070709',
    bgSecondary: '#0c120f',
    bgElevated: '#111a15',
    card: 'rgba(18, 26, 22, 0.85)',
    cardBorder: 'rgba(74, 222, 128, 0.15)',
    cardBorderSubtle: 'rgba(255, 255, 255, 0.07)',
    cardHover: 'rgba(28, 40, 34, 0.95)',
    
    // Accents
    accent: '#34d399',       // Luminous Emerald
    accentBright: '#10b981', // Solid Emerald
    accentGlow: 'rgba(52, 211, 153, 0.35)',
    accentDim: 'rgba(52, 211, 153, 0.12)',
    
    // Golden amber (for sun aura & welcome hero)
    amber: '#f59e0b',
    amberGlow: 'rgba(245, 158, 11, 0.4)',
    
    // Text
    paper: '#f3eee4',        // Warm Linen/Paper white
    paperDim: '#d1cdc4',
    muted: '#8a94a6',
    dimmed: '#525a68',
    subtle: '#2a323d',
    
    // Badges & status
    success: '#34d399',
    warn: '#fbbf24',
    danger: '#f43f5e',
    info: '#60a5fa',
  },
  radius: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 22,
    xl: 30,
    full: 9999,
  },
  typography: {
    serif: 'serif',
    sans: 'sans-serif',
    mono: 'monospace',
  }
};

export const CATEGORIES: CategoryInfo[] = [
  { id: 'deep-work', label: 'Deep work', color: '#f2c85b', emoji: '🎯' },
  { id: 'meetings', label: 'Meetings', color: '#7aa2f7', emoji: '🗣️' },
  { id: 'admin', label: 'Admin', color: '#c0caf5', emoji: '🗂️' },
  { id: 'learning', label: 'Learning', color: '#9ece6a', emoji: '📚' },
  { id: 'health', label: 'Health', color: '#f7768e', emoji: '💪' },
  { id: 'personal', label: 'Personal', color: '#bb9af7', emoji: '🌿' },
  { id: 'break', label: 'Break', color: '#73daca', emoji: '☕' },
];

export const PRIORITIES: Record<Priority, { label: string; color: string; rank: number; badgeColor: string }> = {
  low: { label: 'Low', color: '#8a94a6', rank: 0, badgeColor: 'rgba(138, 148, 166, 0.2)' },
  medium: { label: 'Medium', color: '#f2c85b', rank: 1, badgeColor: 'rgba(242, 200, 91, 0.2)' },
  high: { label: 'High', color: '#ff9f5a', rank: 2, badgeColor: 'rgba(255, 159, 90, 0.2)' },
  urgent: { label: 'Urgent', color: '#ff5c7a', rank: 3, badgeColor: 'rgba(255, 92, 122, 0.25)' },
};

export const ENERGY_LEVELS = [
  { value: 1, emoji: '😩', label: 'Drained' },
  { value: 2, emoji: '😕', label: 'Meh' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '🤩', label: 'Energised' },
];

// Helper to get category by ID
export const getCategory = (catId?: string): CategoryInfo => {
  return CATEGORIES.find(c => c.id === catId) || CATEGORIES[0];
};

// Generate realistic seed data for DaySet
export const INITIAL_TODOS: Todo[] = [
  {
    id: 'todo-1',
    title: 'Finish quarterly report tomorrow',
    priority: 'high',
    due_at: new Date(Date.now() + 14 * 3600 * 1000).toISOString(),
    tags: ['work', 'q3'],
    status: 'open',
    category: 'deep-work',
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    notes: 'Include key retention metrics and MCP agent throughput.',
  },
  {
    id: 'todo-2',
    title: 'Review MCP agent pull requests',
    priority: 'urgent',
    due_at: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    tags: ['code', 'mcp'],
    status: 'open',
    category: 'deep-work',
    created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    notes: 'Verify JSON-RPC 2.0 transport compatibility.',
  },
  {
    id: 'todo-3',
    title: 'Align on design system tokens with team',
    priority: 'medium',
    due_at: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
    tags: ['design'],
    status: 'open',
    category: 'meetings',
    created_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
  },
  {
    id: 'todo-4',
    title: 'Afternoon hydration & stretch break',
    priority: 'low',
    due_at: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    tags: ['health'],
    status: 'open',
    category: 'health',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'todo-5',
    title: 'Morning inbox zero triage',
    priority: 'medium',
    due_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    tags: ['admin'],
    status: 'done',
    completed_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    category: 'admin',
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
];

// Helper to construct today's activity timestamps
const getTodayTime = (hours: number, minutes: number) => {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    title: 'Morning Deep Work: Architecture Planning',
    category: 'deep-work',
    duration_min: 75,
    started_at: getTodayTime(8, 0),
    ended_at: getTodayTime(9, 15),
    notes: 'Outlined distributed sync protocol',
  },
  {
    id: 'act-2',
    title: 'Daily Standup Sync',
    category: 'meetings',
    duration_min: 30,
    started_at: getTodayTime(9, 30),
    ended_at: getTodayTime(10, 0),
    notes: 'Reviewed blockers and upcoming deployments',
  },
  {
    id: 'act-3',
    title: 'Typescript & Native Reanimated Study',
    category: 'learning',
    duration_min: 45,
    started_at: getTodayTime(10, 15),
    ended_at: getTodayTime(11, 0),
  },
];

export const INITIAL_REMINDERS: Reminder[] = [
  {
    id: 'rem-1',
    title: 'Submit pull request before lunch',
    remind_at: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
    status: 'pending',
    created_at: new Date().toISOString(),
  },
  {
    id: 'rem-2',
    title: 'Team sync on Discord room #engineering',
    remind_at: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    status: 'pending',
    created_at: new Date().toISOString(),
  },
  {
    id: 'rem-3',
    title: 'Pick up dry cleaning',
    remind_at: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
    status: 'pending',
    created_at: new Date().toISOString(),
  },
];
