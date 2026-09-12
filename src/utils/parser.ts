import { ActivityCategory, ParsedInput, Priority } from '../types';

export function parseNaturalLanguage(raw: string, referenceDate: Date = new Date()): ParsedInput {
  let text = ' ' + raw.trim() + ' ';
  let kind: ParsedInput['kind'] = 'todo';
  let priority: Priority | undefined = undefined;
  const tags: string[] = [];
  let durationMin: number | undefined = undefined;
  let category: ActivityCategory | undefined = undefined;
  let dueAt: Date | null = null;

  // 1. Determine Kind
  const reminderMatch = text.match(/^\s*(?:please\s+)?remind\s+me\s+(?:to\s+|about\s+|that\s+|of\s+)?/i) ||
                        text.match(/^\s*(?:set\s+(?:a\s+)?)?reminder\s*(?:to|for|:)?\s*/i);
  const logMatch = text.match(/^\s*(?:log|logged|track|tracked|record|spent|i\s+spent)\s+/i);
  const startMatch = text.match(/^\s*(?:start|begin)\s+(?:a\s+)?(?:focus(?:ing)?\s+(?:on\s+)?|timer\s+(?:for\s+|on\s+)?|working\s+on\s+|session\s+(?:on\s+|for\s+)?)?/i);
  const todoMatch = text.match(/^\s*(?:add|create|new|make)\s+(?:a\s+)?(?:todo|task|item)\s*(?:to|:|called|named)?\s*/i);

  if (reminderMatch) {
    kind = 'reminder';
    text = ' ' + text.slice(reminderMatch[0].length);
  } else if (logMatch) {
    kind = 'log';
    text = ' ' + text.slice(logMatch[0].length);
  } else if (startMatch) {
    kind = 'start';
    text = ' ' + text.slice(startMatch[0].length);
  } else if (todoMatch) {
    kind = 'todo';
    text = ' ' + text.slice(todoMatch[0].length);
  }

  // 2. Extract Tags (#tag)
  text = text.replace(/(^|\s)#([\w-]+)/g, (_, __, tag) => {
    tags.push(tag.toLowerCase());
    return ' ';
  });

  // 3. Extract Priority (!urgent, !high, !med, !low, etc.)
  const priorityPatterns: [RegExp, Priority][] = [
    [/\s(?:!urgent|!!!|urgent|asap|p0)(?=\s|,|\.|$)/i, 'urgent'],
    [/\s(?:!high|!!|high(?:\s+priority)?|important|p1)(?=\s|,|\.|$)/i, 'high'],
    [/\s(?:!med|!medium|medium(?:\s+priority)?|p2)(?=\s|,|\.|$)/i, 'medium'],
    [/\s(?:!low|low(?:\s+priority)?|someday|p3)(?=\s|,|\.|$)/i, 'low'],
  ];

  for (const [regex, prio] of priorityPatterns) {
    if (regex.test(text)) {
      priority = prio;
      text = text.replace(regex, ' ');
      break;
    }
  }

  // 4. Extract Category
  const catKeywords: [RegExp, ActivityCategory][] = [
    [/\b(?:deep[- ]work|coding|programming|writing|architecture|design)\b/i, 'deep-work'],
    [/\b(?:meeting|sync|standup|call|huddle|discussion)\b/i, 'meetings'],
    [/\b(?:admin|email|inbox|bills|finance|paperwork)\b/i, 'admin'],
    [/\b(?:learning|study|reading|course|tutorial|research)\b/i, 'learning'],
    [/\b(?:health|workout|gym|exercise|walk|run|stretch|meditation)\b/i, 'health'],
    [/\b(?:personal|family|groceries|shopping|chores|home)\b/i, 'personal'],
    [/\b(?:break|coffee|lunch|rest|relax)\b/i, 'break'],
  ];

  for (const [regex, cat] of catKeywords) {
    if (regex.test(text)) {
      category = cat;
      break;
    }
  }

  // 5. Extract Duration (e.g. 30m, 45 mins, 1.5h, 2 hours)
  const durationMatch = text.match(/\b(\d+(?:\.\d+)?)\s*(m|min|mins|minutes|h|hr|hrs|hours)\b/i);
  if (durationMatch) {
    const val = parseFloat(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase();
    if (unit.startsWith('h')) {
      durationMin = Math.round(val * 60);
    } else {
      durationMin = Math.round(val);
    }
    text = text.replace(durationMatch[0], ' ');
  }

  // 6. Extract Relative Times (e.g., in 20m, tomorrow, tonight, at 3pm)
  const inTimeMatch = text.match(/\bin\s+(\d+)\s*(m|min|mins|minutes|h|hr|hrs|hours)\b/i);
  if (inTimeMatch) {
    const amount = parseInt(inTimeMatch[1], 10);
    const unit = inTimeMatch[2].toLowerCase();
    const future = new Date(referenceDate);
    if (unit.startsWith('h')) {
      future.setHours(future.getHours() + amount);
    } else {
      future.setMinutes(future.getMinutes() + amount);
    }
    dueAt = future;
    text = text.replace(inTimeMatch[0], ' ');
  } else if (/\btomorrow\b/i.test(text)) {
    const tomorrow = new Date(referenceDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // Default to 9:00 AM
    dueAt = tomorrow;
    text = text.replace(/\btomorrow\b/i, ' ');
  } else if (/\btonight\b/i.test(text)) {
    const tonight = new Date(referenceDate);
    tonight.setHours(20, 0, 0, 0);
    dueAt = tonight;
    text = text.replace(/\btonight\b/i, ' ');
  } else if (/\btoday\b/i.test(text)) {
    const today = new Date(referenceDate);
    today.setHours(17, 0, 0, 0);
    dueAt = today;
    text = text.replace(/\btoday\b/i, ' ');
  } else {
    // Check for "at 3pm", "at 14:30"
    const atTimeMatch = text.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
    if (atTimeMatch) {
      let hours = parseInt(atTimeMatch[1], 10);
      const mins = atTimeMatch[2] ? parseInt(atTimeMatch[2], 10) : 0;
      const meridiem = atTimeMatch[3]?.toLowerCase();
      if (meridiem === 'pm' && hours < 12) hours += 12;
      if (meridiem === 'am' && hours === 12) hours = 0;
      const target = new Date(referenceDate);
      target.setHours(hours, mins, 0, 0);
      if (target.getTime() < referenceDate.getTime()) {
        target.setDate(target.getDate() + 1);
      }
      dueAt = target;
      text = text.replace(atTimeMatch[0], ' ');
    }
  }

  // Clean title
  let title = text.replace(/\s+/g, ' ').trim();
  if (!title) {
    title = kind === 'start' ? 'Focus Session' : kind === 'log' ? 'Logged Activity' : 'Quick Todo';
  }

  return {
    kind,
    title,
    priority: priority || (kind === 'todo' ? 'medium' : undefined),
    tags,
    durationMin: durationMin || (kind === 'log' ? 30 : undefined),
    category: category || 'deep-work',
    dueAt,
  };
}

export function formatTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
