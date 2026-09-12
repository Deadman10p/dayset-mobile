import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '../context/DataContext';
import { THEME, PRIORITIES } from '../constants/theme';
import { TaskCard } from '../components/TaskCard';
import { CustomIcon } from '../components/CustomIcon';
import { NewTaskModal } from '../components/NewTaskModal';
import { TourSpotlightBadge } from '../components/TourSpotlightBadge';
import { Priority, Todo } from '../types';

interface TodosScreenProps {
  activeHighlightStep?: string | null;
}

export const TodosScreen: React.FC<TodosScreenProps> = ({ activeHighlightStep }) => {
  const { todos, completeTodo, reopenTodo, snoozeTodo, deleteTodo, showToast } = useData();
  const [filterTab, setFilterTab] = useState<'all' | 'today' | 'inbox' | 'done'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [selectedPriority, setSelectedPriority] = useState<Priority | null>(null);
  const [newTaskVisible, setNewTaskVisible] = useState(false);

  const now = new Date();
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  // Filter tasks
  const filteredTodos = todos.filter(t => {
    if (selectedPriority && t.priority !== selectedPriority) return false;

    if (filterTab === 'today') {
      if (t.status !== 'open') return false;
      if (!t.due_at) return true;
      return new Date(t.due_at) <= todayEnd;
    }
    if (filterTab === 'inbox') {
      return t.status === 'open' && !t.due_at;
    }
    if (filterTab === 'done') {
      return t.status === 'done';
    }
    // 'all': show open tasks first
    return true;
  });

  // Kanban groupings for Board view
  const boardColumns: { id: Priority; label: string; tasks: Todo[] }[] = [
    {
      id: 'urgent',
      label: 'URGENT',
      tasks: filteredTodos.filter(t => t.status === 'open' && t.priority === 'urgent'),
    },
    {
      id: 'high',
      label: 'HIGH PRIORITY',
      tasks: filteredTodos.filter(t => t.status === 'open' && t.priority === 'high'),
    },
    {
      id: 'medium',
      label: 'MEDIUM',
      tasks: filteredTodos.filter(t => t.status === 'open' && t.priority === 'medium'),
    },
    {
      id: 'low',
      label: 'LOW / SOMEDAY',
      tasks: filteredTodos.filter(t => t.status === 'open' && t.priority === 'low'),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {activeHighlightStep === 'board' && (
        <TourSpotlightBadge
          stepNumber={6}
          label="Kanban & Task Board"
          color="#ff9f5a"
          direction="down"
        />
      )}

      {/* Top Header */}
      <View style={[styles.header, activeHighlightStep === 'board' && styles.highlightedHeader]}>
        <View>
          <Text style={styles.headerSub}>YOUR PLATE</Text>
          <Text style={styles.headerTitle}>Task Ledger</Text>
        </View>

        <View style={styles.headerActions}>
          {/* List / Board view toggle */}
          <View style={styles.toggleGroup}>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
              onPress={() => setViewMode('list')}
            >
              <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
                List
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'board' && styles.toggleBtnActive]}
              onPress={() => setViewMode('board')}
            >
              <Text style={[styles.toggleText, viewMode === 'board' && styles.toggleTextActive]}>
                Board
              </Text>
            </TouchableOpacity>
          </View>

          {/* New Task Button */}
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setNewTaskVisible(true)}
            activeOpacity={0.8}
          >
            <CustomIcon name="plus" size={16} color="#070709" strokeWidth={2.5} />
            <Text style={styles.addBtnText}>New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {(['all', 'today', 'inbox', 'done'] as const).map(tab => {
          const isActive = filterTab === tab;
          let count = 0;
          if (tab === 'all') count = todos.filter(t => t.status === 'open').length;
          if (tab === 'today') count = todos.filter(t => t.status === 'open' && (!t.due_at || new Date(t.due_at) <= todayEnd)).length;
          if (tab === 'inbox') count = todos.filter(t => t.status === 'open' && !t.due_at).length;
          if (tab === 'done') count = todos.filter(t => t.status === 'done').length;

          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabPill, isActive && styles.tabPillActive]}
              onPress={() => setFilterTab(tab)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
              <View style={[styles.countBadge, isActive && styles.countBadgeActive]}>
                <Text style={[styles.countText, isActive && styles.countTextActive]}>
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Priority Filter Bar */}
      <View style={styles.prioFilterRow}>
        <Text style={styles.prioFilterLabel}>Priority:</Text>
        {(['urgent', 'high', 'medium', 'low'] as Priority[]).map(p => {
          const isSelected = selectedPriority === p;
          const pInfo = PRIORITIES[p];
          return (
            <TouchableOpacity
              key={p}
              style={[
                styles.prioChip,
                isSelected && { backgroundColor: pInfo.badgeColor, borderColor: pInfo.color },
              ]}
              onPress={() => setSelectedPriority(isSelected ? null : p)}
            >
              <Text
                style={[
                  styles.prioChipText,
                  isSelected && { color: pInfo.color, fontWeight: '700' },
                ]}
              >
                !{p}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content: List or Kanban Board */}
      {viewMode === 'list' ? (
        <FlatList
          data={filteredTodos}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TaskCard
              todo={item}
              onComplete={async () => {
                if (item.status === 'done') {
                  await reopenTodo(item.id);
                  showToast('Reopened', item.title, 'info');
                } else {
                  await completeTodo(item.id);
                  showToast('Completed!', item.title, 'success');
                }
              }}
              onSnooze={async () => {
                await snoozeTodo(item.id, 24);
                showToast('Snoozed', 'Postponed to tomorrow', 'info');
              }}
              onDelete={async () => {
                await deleteTodo(item.id);
                showToast('Removed', item.title, 'info');
              }}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <CustomIcon name="checkbox" size={32} color="#8a94a6" />
              <Text style={styles.emptyTitle}>Nothing in this view</Text>
              <Text style={styles.emptySub}>
                Tap "+ New" above to capture a task onto your plate.
              </Text>
            </View>
          }
        />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.boardScrollContainer}
        >
          {boardColumns.map(col => (
            <View key={col.id} style={styles.boardCol}>
              <View style={styles.colHeader}>
                <View
                  style={[
                    styles.colDot,
                    { backgroundColor: PRIORITIES[col.id].color },
                  ]}
                />
                <Text style={styles.colTitle}>{col.label}</Text>
                <Text style={styles.colCount}>{col.tasks.length}</Text>
              </View>

              <ScrollView style={styles.colBody} showsVerticalScrollIndicator={false}>
                {col.tasks.length === 0 ? (
                  <View style={styles.emptyColBox}>
                    <Text style={styles.emptyColText}>No tasks</Text>
                  </View>
                ) : (
                  col.tasks.map(t => (
                    <TaskCard
                      key={t.id}
                      todo={t}
                      onComplete={() => completeTodo(t.id)}
                      onSnooze={() => snoozeTodo(t.id, 24)}
                      onDelete={() => deleteTodo(t.id)}
                    />
                  ))
                )}
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      )}

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
  },
  highlightedHeader: {
    backgroundColor: 'rgba(255, 159, 90, 0.08)',
    borderWidth: 1.5,
    borderColor: '#ff9f5a',
    borderRadius: 16,
    marginHorizontal: 10,
    paddingHorizontal: 12,
  },
  headerSub: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#8a94a6',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: THEME.typography.serif,
    color: '#f3eee4',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 3,
  },
  toggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
  },
  toggleText: {
    fontSize: 11,
    color: '#8a94a6',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#34d399',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#34d399',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#070709',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 8,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tabPillActive: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderColor: '#34d399',
  },
  tabText: {
    fontSize: 12,
    color: '#8a94a6',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#34d399',
    fontWeight: '700',
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 9999,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  countBadgeActive: {
    backgroundColor: '#34d399',
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8a94a6',
  },
  countTextActive: {
    color: '#070709',
  },
  prioFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  prioFilterLabel: {
    fontSize: 11,
    color: '#8a94a6',
  },
  prioChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  prioChipText: {
    fontSize: 11,
    color: '#8a94a6',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: THEME.typography.serif,
    color: '#f3eee4',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    color: '#8a94a6',
  },
  boardScrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 110,
    gap: 14,
  },
  boardCol: {
    width: 270,
    backgroundColor: 'rgba(18, 26, 22, 0.7)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    padding: 12,
    maxHeight: '94%',
  },
  colHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  colDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  colTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#f3eee4',
    flex: 1,
  },
  colCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8a94a6',
  },
  colBody: {
    flex: 1,
  },
  emptyColBox: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyColText: {
    fontSize: 12,
    color: '#8a94a6',
    fontStyle: 'italic',
  },
});
