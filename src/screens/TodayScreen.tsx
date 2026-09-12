import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '../context/DataContext';
import { THEME } from '../constants/theme';
import { HeaderClock } from '../components/HeaderClock';
import { DayArc } from '../components/DayArc';
import { Omnibar } from '../components/Omnibar';
import { FocusWidget } from '../components/FocusWidget';
import { TaskCard } from '../components/TaskCard';
import { RemindersWidget } from '../components/RemindersWidget';
import { DayLogWidget } from '../components/DayLogWidget';
import { CustomIcon } from '../components/CustomIcon';
import { NewTaskModal } from '../components/NewTaskModal';
import { TourModal } from '../components/TourModal';

interface TodayScreenProps {
  navigation: any;
  onOpenTour?: () => void;
  autofillValue?: string;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({
  navigation,
  onOpenTour,
  autofillValue,
}) => {
  const { todos, completeTodo, snoozeTodo, deleteTodo, showToast } = useData();
  const [refreshing, setRefreshing] = useState(false);
  const [newTaskVisible, setNewTaskVisible] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  // Filter tasks due today & overdue
  const now = new Date();
  const tomorrowStart = new Date(now);
  tomorrowStart.setHours(24, 0, 0, 0);

  const dueTodayAndOverdue = todos.filter(t => {
    if (t.status !== 'open') return false;
    if (!t.due_at) return true; // Inbox/today
    const due = new Date(t.due_at);
    return due < tomorrowStart;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Bar with Brand & Quick Tour Button */}
      <View style={styles.topNav}>
        <View style={styles.brandRow}>
          <View style={styles.brandLogo}>
            <Text style={styles.brandLogoText}>L</Text>
          </View>
          <Text style={styles.brandTitle}>DAYTRACKER</Text>
        </View>

        <View style={styles.topActions}>
          <TouchableOpacity
            style={styles.tourBtn}
            onPress={onOpenTour}
            activeOpacity={0.7}
          >
            <CustomIcon name="help" size={13} color="#8a94a6" />
            <Text style={styles.tourBtnText}>Tour</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#34d399"
          />
        }
      >
        {/* Header with Date, Greeting, and Digital Clock */}
        <HeaderClock onPressProfile={() => navigation.navigate('Settings')} />

        {/* Omnibar Quick Capture Input */}
        <Omnibar externalValue={autofillValue} />

        {/* Hero: 24-Hour Day Arc */}
        <DayArc onQuickLogPress={() => navigation.navigate('Journal')} />

        {/* On Your Plate Section */}
        <View style={styles.plateCard}>
          <View style={styles.plateHeaderRow}>
            <View>
              <Text style={styles.plateSubtitle}>ON YOUR PLATE</Text>
              <Text style={styles.plateTitle}>Due today & overdue</Text>
            </View>

            <View style={styles.plateActionsRow}>
              <TouchableOpacity
                style={styles.newBtn}
                onPress={() => setNewTaskVisible(true)}
                activeOpacity={0.7}
              >
                <CustomIcon name="plus" size={12} color="#f3eee4" />
                <Text style={styles.newBtnText}>New</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tasks List or Empty State */}
          {dueTodayAndOverdue.length === 0 ? (
            <View style={styles.emptyPlateBox}>
              <View style={styles.emptyCheckCircle}>
                <CustomIcon name="check" size={24} color="#34d399" strokeWidth={3} />
              </View>
              <Text style={styles.emptyPlateTitle}>Nothing due today</Text>
              <Text style={styles.emptyPlateSub}>
                Type above to add something, or ask Ledger by voice.
              </Text>
              <TouchableOpacity
                style={styles.openBoardBtn}
                onPress={() => navigation.navigate('Todos')}
              >
                <Text style={styles.openBoardText}>Open the board →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.tasksList}>
              <Text style={styles.swipeHintText}>
                tap check to complete · snooze to delay
              </Text>
              {dueTodayAndOverdue.map(todo => (
                <TaskCard
                  key={todo.id}
                  todo={todo}
                  onComplete={async () => {
                    await completeTodo(todo.id);
                    showToast('Completed!', todo.title, 'success');
                  }}
                  onSnooze={async () => {
                    await snoozeTodo(todo.id, 24);
                    showToast('Snoozed', 'Moved to tomorrow', 'info');
                  }}
                  onDelete={async () => {
                    await deleteTodo(todo.id);
                    showToast('Deleted', todo.title, 'info');
                  }}
                  onPress={() => navigation.navigate('Todos')}
                />
              ))}
            </View>
          )}
        </View>

        {/* Focus Widget (Radial Timer & Categories) */}
        <FocusWidget />

        {/* Upcoming Reminders Widget */}
        <RemindersWidget onViewAll={() => navigation.navigate('Todos')} />

        {/* Day Log Widget */}
        <DayLogWidget onViewJournal={() => navigation.navigate('Journal')} />
      </ScrollView>

      {/* New Task Sheet Modal */}
      <NewTaskModal
        visible={newTaskVisible}
        onClose={() => setNewTaskVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#070709',
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogo: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#34d399',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogoText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#070709',
  },
  brandTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#f3eee4',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tourBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 9999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  tourBtnText: {
    fontSize: 11,
    color: '#8a94a6',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  plateCard: {
    marginHorizontal: 12,
    marginBottom: 12,
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorderSubtle,
    padding: 14,
  },
  plateHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  plateSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#8a94a6',
    marginBottom: 2,
  },
  plateTitle: {
    fontSize: 20,
    fontFamily: THEME.typography.serif,
    color: '#f3eee4',
  },
  plateActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  newBtnText: {
    fontSize: 11,
    color: '#f3eee4',
    fontWeight: '600',
  },
  swipeHintText: {
    fontSize: 10,
    color: '#8a94a6',
    marginBottom: 8,
    textAlign: 'right',
  },
  tasksList: {
    marginTop: 4,
  },
  emptyPlateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyCheckCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyPlateTitle: {
    fontSize: 16,
    fontFamily: THEME.typography.serif,
    color: '#f3eee4',
    marginBottom: 4,
  },
  emptyPlateSub: {
    fontSize: 12,
    color: '#8a94a6',
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 18,
    marginBottom: 14,
  },
  openBoardBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  openBoardText: {
    fontSize: 13,
    color: '#34d399',
    fontWeight: '600',
  },
});
