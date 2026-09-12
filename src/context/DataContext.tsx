import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Todo,
  Activity,
  Reminder,
  LogEvent,
  UserSettings,
  JournalEntry,
  ActivityCategory,
  Priority,
} from '../types';
import {
  INITIAL_TODOS,
  INITIAL_ACTIVITIES,
  INITIAL_REMINDERS,
} from '../constants/theme';

interface ToastMessage {
  id: string;
  title: string;
  body?: string;
  tone?: 'success' | 'info' | 'warn' | 'error';
}

interface DataContextType {
  ready: boolean;
  todos: Todo[];
  activities: Activity[];
  reminders: Reminder[];
  events: LogEvent[];
  settings: UserSettings;
  journal: Record<string, JournalEntry>;
  runningActivity: Activity | null;
  runningElapsedSeconds: number;
  stats: {
    plateCount: number;
    doneTodayCount: number;
    loggedMinutesToday: number;
  };
  toast: ToastMessage | null;
  showToast: (title: string, body?: string, tone?: ToastMessage['tone']) => void;
  hideToast: () => void;
  // Todo methods
  addTodo: (params: {
    title: string;
    priority?: Priority;
    due_at?: string | null;
    tags?: string[];
    category?: ActivityCategory;
    notes?: string;
  }) => Promise<Todo>;
  completeTodo: (id: string) => Promise<void>;
  reopenTodo: (id: string) => Promise<void>;
  snoozeTodo: (id: string, hours?: number) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  // Activity / Focus methods
  startActivity: (title: string, category: ActivityCategory) => Promise<Activity>;
  stopActivity: () => Promise<Activity | null>;
  addActivity: (params: {
    title: string;
    category: ActivityCategory;
    duration_min: number;
    started_at?: string;
    notes?: string;
  }) => Promise<Activity>;
  deleteActivity: (id: string) => Promise<void>;
  // Reminder methods
  addReminder: (params: { title: string; remind_at: string }) => Promise<Reminder>;
  completeReminder: (id: string) => Promise<void>;
  snoozeReminder: (id: string, minutes?: number) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  // Journal methods
  saveJournalEntry: (entry: Partial<JournalEntry> & { date: string }) => Promise<void>;
  // Settings methods
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  logEvent: (action: string, summary: string, actor?: 'user' | 'agent' | 'system') => Promise<void>;
  resetToDefaultData: () => Promise<void>;
}

const STORAGE_KEYS = {
  TODOS: '@dayset_todos_v1',
  ACTIVITIES: '@dayset_activities_v1',
  REMINDERS: '@dayset_reminders_v1',
  EVENTS: '@dayset_events_v1',
  SETTINGS: '@dayset_settings_v1',
  JOURNAL: '@dayset_journal_v1',
};

const DEFAULT_SETTINGS: UserSettings = {
  userName: 'The Deadman',
  email: 'deadman@dayset.io',
  voiceVoice: 'Ledger (Warm British)',
  theme: 'emerald',
  mcpToken: 'dt_live_9f83a2c410e7b45',
  isDemoUser: false,
};

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [todos, setTodos] = useState<Todo[]>(INITIAL_TODOS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [reminders, setReminders] = useState<Reminder[]>(INITIAL_REMINDERS);
  const [events, setEvents] = useState<LogEvent[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [journal, setJournal] = useState<Record<string, JournalEntry>>({});
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [runningElapsedSeconds, setRunningElapsedSeconds] = useState(0);

  // Load saved state from AsyncStorage
  useEffect(() => {
    async function loadData() {
      try {
        const [savedTodos, savedActs, savedRems, savedEvents, savedSettings, savedJournal] =
          await Promise.all([
            AsyncStorage.getItem(STORAGE_KEYS.TODOS),
            AsyncStorage.getItem(STORAGE_KEYS.ACTIVITIES),
            AsyncStorage.getItem(STORAGE_KEYS.REMINDERS),
            AsyncStorage.getItem(STORAGE_KEYS.EVENTS),
            AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
            AsyncStorage.getItem(STORAGE_KEYS.JOURNAL),
          ]);

        if (savedTodos) setTodos(JSON.parse(savedTodos));
        if (savedActs) setActivities(JSON.parse(savedActs));
        if (savedRems) setReminders(JSON.parse(savedRems));
        if (savedEvents) setEvents(JSON.parse(savedEvents));
        if (savedSettings) setSettings(JSON.parse(savedSettings));
        if (savedJournal) setJournal(JSON.parse(savedJournal));
      } catch (err) {
        console.error('Failed to load local data', err);
      } finally {
        setReady(true);
      }
    }
    loadData();
  }, []);

  // Sync to AsyncStorage on updates
  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos)).catch(() => {});
  }, [todos, ready]);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities)).catch(() => {});
  }, [activities, ready]);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders)).catch(() => {});
  }, [reminders, ready]);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events)).catch(() => {});
  }, [events, ready]);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)).catch(() => {});
  }, [settings, ready]);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(journal)).catch(() => {});
  }, [journal, ready]);

  // Find running activity
  const runningActivity = useMemo(() => {
    return activities.find(a => !a.ended_at) || null;
  }, [activities]);

  // Timer loop for running activity
  useEffect(() => {
    if (!runningActivity) {
      setRunningElapsedSeconds(0);
      return;
    }
    const updateElapsed = () => {
      const startMs = new Date(runningActivity.started_at).getTime();
      const nowMs = Date.now();
      const elapsed = Math.max(0, Math.floor((nowMs - startMs) / 1000));
      setRunningElapsedSeconds(elapsed);
    };
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [runningActivity]);

  const showToast = useCallback((title: string, body?: string, tone: ToastMessage['tone'] = 'success') => {
    const id = Date.now().toString();
    setToast({ id, title, body, tone });
    setTimeout(() => {
      setToast(prev => (prev?.id === id ? null : prev));
    }, 3800);
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const logEvent = useCallback(
    async (action: string, summary: string, actor: 'user' | 'agent' | 'system' = 'user') => {
      const newEvent: LogEvent = {
        id: 'evt-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        action,
        summary,
        actor,
        created_at: new Date().toISOString(),
      };
      setEvents(prev => [newEvent, ...prev.slice(0, 100)]);
    },
    []
  );

  // Todo operations
  const addTodo = useCallback(
    async (params: {
      title: string;
      priority?: Priority;
      due_at?: string | null;
      tags?: string[];
      category?: ActivityCategory;
      notes?: string;
    }): Promise<Todo> => {
      const newTodo: Todo = {
        id: 'todo-' + Date.now(),
        title: params.title.trim(),
        priority: params.priority || 'medium',
        due_at: params.due_at ?? null,
        tags: params.tags || [],
        status: 'open',
        category: params.category || 'deep-work',
        notes: params.notes,
        created_at: new Date().toISOString(),
      };
      setTodos(prev => [newTodo, ...prev]);
      logEvent('todo_added', `Added todo "${newTodo.title}"`);
      return newTodo;
    },
    [logEvent]
  );

  const completeTodo = useCallback(
    async (id: string) => {
      const target = todos.find(t => t.id === id);
      setTodos(prev =>
        prev.map(t =>
          t.id === id ? { ...t, status: 'done', completed_at: new Date().toISOString() } : t
        )
      );
      if (target) {
        logEvent('todo_completed', `Completed "${target.title}"`);
      }
    },
    [todos, logEvent]
  );

  const reopenTodo = useCallback(
    async (id: string) => {
      setTodos(prev =>
        prev.map(t =>
          t.id === id ? { ...t, status: 'open', completed_at: null } : t
        )
      );
      logEvent('todo_reopened', `Reopened todo ${id}`);
    },
    [logEvent]
  );

  const snoozeTodo = useCallback(
    async (id: string, hours: number = 24) => {
      const target = todos.find(t => t.id === id);
      const newDue = new Date(Date.now() + hours * 3600 * 1000);
      setTodos(prev =>
        prev.map(t =>
          t.id === id ? { ...t, due_at: newDue.toISOString(), status: 'open' } : t
        )
      );
      if (target) {
        logEvent('todo_snoozed', `Snoozed "${target.title}"`);
      }
    },
    [todos, logEvent]
  );

  const deleteTodo = useCallback(
    async (id: string) => {
      const target = todos.find(t => t.id === id);
      setTodos(prev => prev.filter(t => t.id !== id));
      if (target) {
        logEvent('todo_deleted', `Deleted "${target.title}"`);
      }
    },
    [todos, logEvent]
  );

  const updateTodo = useCallback(
    async (id: string, updates: Partial<Todo>) => {
      setTodos(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
    },
    []
  );

  // Activity operations
  const startActivity = useCallback(
    async (title: string, category: ActivityCategory): Promise<Activity> => {
      // First stop any running activity
      if (runningActivity) {
        await stopActivity();
      }
      const newAct: Activity = {
        id: 'act-' + Date.now(),
        title: title.trim() || 'Focus Session',
        category,
        duration_min: 0,
        started_at: new Date().toISOString(),
        ended_at: null,
      };
      setActivities(prev => [newAct, ...prev]);
      logEvent('activity_started', `Started ${category} session: "${newAct.title}"`);
      return newAct;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [runningActivity, logEvent]
  );

  const stopActivity = useCallback(async (): Promise<Activity | null> => {
    if (!runningActivity) return null;
    const now = new Date();
    const start = new Date(runningActivity.started_at);
    const durationMin = Math.max(1, Math.round((now.getTime() - start.getTime()) / 60000));
    const completedAct: Activity = {
      ...runningActivity,
      ended_at: now.toISOString(),
      duration_min: durationMin,
    };
    setActivities(prev =>
      prev.map(a => (a.id === runningActivity.id ? completedAct : a))
    );
    logEvent(
      'activity_stopped',
      `Logged ${durationMin}m of ${completedAct.category}: "${completedAct.title}"`
    );
    return completedAct;
  }, [runningActivity, logEvent]);

  const addActivity = useCallback(
    async (params: {
      title: string;
      category: ActivityCategory;
      duration_min: number;
      started_at?: string;
      notes?: string;
    }): Promise<Activity> => {
      const end = new Date();
      const start = params.started_at
        ? new Date(params.started_at)
        : new Date(end.getTime() - params.duration_min * 60000);
      const newAct: Activity = {
        id: 'act-' + Date.now(),
        title: params.title.trim() || 'Logged Activity',
        category: params.category,
        duration_min: params.duration_min,
        started_at: start.toISOString(),
        ended_at: end.toISOString(),
        notes: params.notes,
      };
      setActivities(prev => [newAct, ...prev]);
      logEvent('activity_logged', `Logged ${params.duration_min}m ${params.category}: "${newAct.title}"`);
      return newAct;
    },
    [logEvent]
  );

  const deleteActivity = useCallback(
    async (id: string) => {
      setActivities(prev => prev.filter(a => a.id !== id));
      logEvent('activity_deleted', `Removed activity ${id}`);
    },
    [logEvent]
  );

  // Reminder operations
  const addReminder = useCallback(
    async (params: { title: string; remind_at: string }): Promise<Reminder> => {
      const newReminder: Reminder = {
        id: 'rem-' + Date.now(),
        title: params.title.trim(),
        remind_at: params.remind_at,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      setReminders(prev => [newReminder, ...prev]);
      logEvent('reminder_created', `Reminder set: "${newReminder.title}"`);
      return newReminder;
    },
    [logEvent]
  );

  const completeReminder = useCallback(
    async (id: string) => {
      setReminders(prev =>
        prev.map(r => (r.id === id ? { ...r, status: 'completed' } : r))
      );
      logEvent('reminder_completed', `Completed reminder ${id}`);
    },
    [logEvent]
  );

  const snoozeReminder = useCallback(
    async (id: string, minutes: number = 30) => {
      const newTime = new Date(Date.now() + minutes * 60000);
      setReminders(prev =>
        prev.map(r => (r.id === id ? { ...r, remind_at: newTime.toISOString(), status: 'pending' } : r))
      );
      logEvent('reminder_snoozed', `Snoozed reminder ${id} by ${minutes}m`);
    },
    [logEvent]
  );

  const deleteReminder = useCallback(
    async (id: string) => {
      setReminders(prev => prev.filter(r => r.id !== id));
      logEvent('reminder_deleted', `Deleted reminder ${id}`);
    },
    [logEvent]
  );

  // Journal
  const saveJournalEntry = useCallback(
    async (entry: Partial<JournalEntry> & { date: string }) => {
      setJournal(prev => ({
        ...prev,
        [entry.date]: {
          date: entry.date,
          energy: entry.energy ?? prev[entry.date]?.energy ?? 3,
          notes: entry.notes ?? prev[entry.date]?.notes ?? '',
          highlights: entry.highlights ?? prev[entry.date]?.highlights ?? [],
        },
      }));
      logEvent('journal_updated', `Saved journal reflection for ${entry.date}`);
    },
    [logEvent]
  );

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const resetToDefaultData = useCallback(async () => {
    setTodos(INITIAL_TODOS);
    setActivities(INITIAL_ACTIVITIES);
    setReminders(INITIAL_REMINDERS);
    setJournal({});
    setEvents([]);
    await AsyncStorage.clear();
    showToast('Reset Complete', 'Restored sample DaySet data', 'info');
  }, [showToast]);

  // Calculated stats for today
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // On plate: open todos with due_at <= tomorrow OR overdue OR no due date
    const onPlate = todos.filter(t => {
      if (t.status !== 'open') return false;
      if (!t.due_at) return true;
      const due = new Date(t.due_at);
      return due < tomorrow;
    }).length;

    // Done today: completed today
    const doneToday = todos.filter(t => {
      if (t.status !== 'done' || !t.completed_at) return false;
      const comp = new Date(t.completed_at);
      return comp >= today && comp < tomorrow;
    }).length;

    // Logged minutes today: sum of activities for today
    const loggedMins = activities.reduce((sum, a) => {
      const actDate = new Date(a.started_at);
      if (actDate >= today && actDate < tomorrow) {
        return sum + (a.duration_min || 0);
      }
      return sum;
    }, 0);

    return {
      plateCount: onPlate,
      doneTodayCount: doneToday,
      loggedMinutesToday: loggedMins,
    };
  }, [todos, activities]);

  return (
    <DataContext.Provider
      value={{
        ready,
        todos,
        activities,
        reminders,
        events,
        settings,
        journal,
        runningActivity,
        runningElapsedSeconds,
        stats,
        toast,
        showToast,
        hideToast,
        addTodo,
        completeTodo,
        reopenTodo,
        snoozeTodo,
        deleteTodo,
        updateTodo,
        startActivity,
        stopActivity,
        addActivity,
        deleteActivity,
        addReminder,
        completeReminder,
        snoozeReminder,
        deleteReminder,
        saveJournalEntry,
        updateSettings,
        logEvent,
        resetToDefaultData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
