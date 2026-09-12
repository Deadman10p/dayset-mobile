import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useData } from '../context/DataContext';
import { THEME } from '../constants/theme';
import { CustomIcon } from './CustomIcon';

interface RemindersWidgetProps {
  onViewAll?: () => void;
}

export const RemindersWidget: React.FC<RemindersWidgetProps> = ({ onViewAll }) => {
  const { reminders, addReminder, completeReminder, deleteReminder, showToast } = useData();
  const [quickTitle, setQuickTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const pendingReminders = reminders.filter(r => r.status === 'pending');

  const handleQuickAdd = async (offsetMinutes: number) => {
    if (!quickTitle.trim()) {
      showToast('Enter a reminder', 'Type what you want to be reminded of first', 'warn');
      return;
    }
    const target = new Date(Date.now() + offsetMinutes * 60000);
    await addReminder({
      title: quickTitle.trim(),
      remind_at: target.toISOString(),
    });
    setQuickTitle('');
    setIsAdding(false);
    showToast('Reminder Scheduled', `Fires in ${offsetMinutes}m`, 'success');
  };

  const formatCountdown = (isoString: string) => {
    const diffMs = new Date(isoString).getTime() - Date.now();
    if (diffMs <= 0) return 'due now';
    const mins = Math.round(diffMs / 60000);
    if (mins < 60) return `in ${mins}m`;
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    return `in ${hrs}h ${m}m`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.headerLabel}>UPCOMING REMINDERS</Text>
        <TouchableOpacity onPress={onViewAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.allLink}>All</Text>
        </TouchableOpacity>
      </View>

      {/* Reminders List or Empty State */}
      {pendingReminders.length === 0 && !isAdding ? (
        <TouchableOpacity
          style={styles.emptyBox}
          onPress={() => setIsAdding(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.emptyText}>
            No reminders queued. Say "remind me to..." or tap here to schedule.
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.list}>
          {pendingReminders.slice(0, 3).map(rem => (
            <View key={rem.id} style={styles.reminderItem}>
              <TouchableOpacity
                style={styles.circleBtn}
                onPress={async () => {
                  await completeReminder(rem.id);
                  showToast('Reminder Cleared', rem.title, 'success');
                }}
              >
                <CustomIcon name="bell" size={13} color="#34d399" />
              </TouchableOpacity>

              <View style={styles.reminderContent}>
                <Text style={styles.reminderTitle} numberOfLines={1}>
                  {rem.title}
                </Text>
                <Text style={styles.reminderCountdown}>
                  {formatCountdown(rem.remind_at)} ·{' '}
                  {new Date(rem.remind_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => deleteReminder(rem.id)}
                style={styles.deleteBtn}
              >
                <CustomIcon name="close" size={14} color="#8a94a6" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Quick Add Bar */}
      {isAdding ? (
        <View style={styles.addSection}>
          <TextInput
            style={styles.input}
            placeholder="Remind me to..."
            placeholderTextColor="#6b7280"
            value={quickTitle}
            onChangeText={setQuickTitle}
            autoFocus
          />
          <View style={styles.presetsRow}>
            <TouchableOpacity
              style={styles.presetPill}
              onPress={() => handleQuickAdd(15)}
            >
              <Text style={styles.presetText}>+15m</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetPill}
              onPress={() => handleQuickAdd(60)}
            >
              <Text style={styles.presetText}>+1 hour</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetPill}
              onPress={() => handleQuickAdd(180)}
            >
              <Text style={styles.presetText}>+3 hours</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.presetPill, { backgroundColor: 'rgba(244, 63, 94, 0.1)' }]}
              onPress={() => setIsAdding(false)}
            >
              <Text style={[styles.presetText, { color: '#f43f5e' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addTrigger}
          onPress={() => setIsAdding(true)}
          activeOpacity={0.7}
        >
          <CustomIcon name="plus" size={13} color="#8a94a6" />
          <Text style={styles.addTriggerText}>Add quick reminder</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginBottom: 12,
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorderSubtle,
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#8a94a6',
  },
  allLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34d399',
  },
  emptyBox: {
    paddingVertical: 14,
  },
  emptyText: {
    fontSize: 13,
    color: '#8a94a6',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  list: {
    gap: 8,
    marginBottom: 10,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: 10,
    gap: 10,
  },
  circleBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 13,
    color: '#f3eee4',
    fontWeight: '500',
  },
  reminderCountdown: {
    fontSize: 11,
    color: '#fbbf24',
    marginTop: 2,
  },
  deleteBtn: {
    padding: 4,
  },
  addSection: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 10,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#f3eee4',
    marginBottom: 8,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  presetPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  presetText: {
    fontSize: 11,
    color: '#f3eee4',
    fontWeight: '500',
  },
  addTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 6,
  },
  addTriggerText: {
    fontSize: 12,
    color: '#8a94a6',
  },
});
