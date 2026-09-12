import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Todo } from '../types';
import { THEME, PRIORITIES } from '../constants/theme';
import { CustomIcon } from './CustomIcon';

interface TaskCardProps {
  todo: Todo;
  onComplete: () => void;
  onSnooze: () => void;
  onDelete: () => void;
  onPress?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  todo,
  onComplete,
  onSnooze,
  onDelete,
  onPress,
}) => {
  const isDone = todo.status === 'done';
  const prio = PRIORITIES[todo.priority];

  // Format due date / time string
  const formatDue = (isoString?: string | null) => {
    if (!isoString) return null;
    const due = new Date(isoString);
    const now = new Date();
    const isToday = due.toDateString() === now.toDateString();
    const isPast = due < now;

    const timeStr = due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) return { label: `Today ${timeStr}`, isPast };
    const dateStr = due.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return { label: `${dateStr} ${timeStr}`, isPast };
  };

  const dueInfo = formatDue(todo.due_at);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isDone && styles.cardDone,
        { borderLeftColor: prio.color, borderLeftWidth: 3 },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.mainRow}>
        {/* Checkbox */}
        <TouchableOpacity
          style={[styles.checkbox, isDone && styles.checkboxDone]}
          onPress={onComplete}
          activeOpacity={0.7}
        >
          {isDone ? (
            <CustomIcon name="check" size={14} color="#070709" strokeWidth={3} />
          ) : null}
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.contentCol}>
          <Text
            style={[styles.title, isDone && styles.titleDone]}
            numberOfLines={2}
          >
            {todo.title}
          </Text>

          {/* Metadata Badges */}
          <View style={styles.metaRow}>
            {/* Priority tag */}
            <View style={[styles.badge, { backgroundColor: prio.badgeColor }]}>
              <Text style={[styles.badgeText, { color: prio.color }]}>
                !{prio.label.toLowerCase()}
              </Text>
            </View>

            {/* Due date tag */}
            {dueInfo && (
              <View
                style={[
                  styles.badge,
                  dueInfo.isPast && !isDone
                    ? styles.badgeOverdue
                    : styles.badgeDue,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    dueInfo.isPast && !isDone ? { color: '#f43f5e' } : { color: '#fbbf24' },
                  ]}
                >
                  {dueInfo.label}
                </Text>
              </View>
            )}

            {/* Custom tags */}
            {todo.tags.map(tag => (
              <View key={tag} style={[styles.badge, styles.badgeTag]}>
                <Text style={styles.badgeTagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action icons */}
        <View style={styles.actionsCol}>
          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={onSnooze}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <CustomIcon name="snooze" size={15} color="#8a94a6" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={onDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <CustomIcon name="trash" size={15} color="#8a94a6" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(18, 26, 22, 0.9)',
    borderRadius: THEME.radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 12,
    marginBottom: 8,
  },
  cardDone: {
    opacity: 0.5,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxDone: {
    backgroundColor: '#34d399',
    borderColor: '#34d399',
  },
  contentCol: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: '#f3eee4',
    lineHeight: 20,
    fontWeight: '500',
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: '#8a94a6',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  badgeDue: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
  },
  badgeOverdue: {
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
  },
  badgeTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  badgeTagText: {
    fontSize: 10,
    color: '#8a94a6',
  },
  actionsCol: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  actionIconBtn: {
    padding: 4,
  },
});
