import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useData } from '../context/DataContext';
import { THEME, getCategory } from '../constants/theme';
import { CustomIcon } from './CustomIcon';
import { formatMinutes } from '../utils/parser';

interface DayLogWidgetProps {
  onViewJournal?: () => void;
}

export const DayLogWidget: React.FC<DayLogWidgetProps> = ({ onViewJournal }) => {
  const { activities } = useData();

  // Filter completed activities from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayActivities = activities.filter(a => {
    if (!a.ended_at) return false;
    const actDate = new Date(a.started_at);
    return actDate >= today;
  });

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.headerLabel}>DAY LOG</Text>
        <TouchableOpacity onPress={onViewJournal} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.journalLink}>Journal</Text>
        </TouchableOpacity>
      </View>

      {todayActivities.length === 0 ? (
        <View style={styles.emptyBox}>
          <CustomIcon name="sparkles" size={16} color="#34d399" />
          <Text style={styles.emptyText}>
            Nothing logged yet. Try "log 30m planning" above or start the focus timer.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {todayActivities.slice(0, 4).map(act => {
            const cat = getCategory(act.category);
            const startTime = new Date(act.started_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            const endTime = act.ended_at
              ? new Date(act.ended_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Now';

            return (
              <View key={act.id} style={styles.itemRow}>
                <View style={[styles.colorBar, { backgroundColor: cat.color }]} />
                <View style={styles.itemContent}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {act.title}
                    </Text>
                    <Text style={styles.itemDuration}>
                      {formatMinutes(act.duration_min)}
                    </Text>
                  </View>
                  <View style={styles.itemSubRow}>
                    <Text style={[styles.catName, { color: cat.color }]}>
                      {cat.emoji} {cat.label}
                    </Text>
                    <Text style={styles.itemTimes}>
                      {startTime} – {endTime}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginBottom: 20,
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
  journalLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34d399',
  },
  emptyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  emptyText: {
    flex: 1,
    fontSize: 13,
    color: '#8a94a6',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  list: {
    gap: 10,
  },
  itemRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  colorBar: {
    width: 4,
  },
  itemContent: {
    flex: 1,
    padding: 10,
  },
  itemTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 13,
    color: '#f3eee4',
    fontWeight: '500',
    flex: 1,
    paddingRight: 8,
  },
  itemDuration: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f3eee4',
  },
  itemSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  catName: {
    fontSize: 11,
    fontWeight: '500',
  },
  itemTimes: {
    fontSize: 11,
    color: '#8a94a6',
  },
});
