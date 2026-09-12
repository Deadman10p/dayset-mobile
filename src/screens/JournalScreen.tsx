import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '../context/DataContext';
import { THEME, ENERGY_LEVELS, CATEGORIES, getCategory } from '../constants/theme';
import { CustomIcon } from '../components/CustomIcon';
import { TourSpotlightBadge } from '../components/TourSpotlightBadge';
import { formatMinutes } from '../utils/parser';

interface JournalScreenProps {
  activeHighlightStep?: string | null;
}

export const JournalScreen: React.FC<JournalScreenProps> = ({ activeHighlightStep }) => {
  const { activities, journal, saveJournalEntry, addActivity, deleteActivity, showToast } = useData();

  // Selected date (defaults to today in YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // New activity form toggle
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDuration, setNewDuration] = useState('45');
  const [newCategory, setNewCategory] = useState(CATEGORIES[0].id);

  // Current journal entry for selected date
  const currentEntry = journal[selectedDate] || {
    date: selectedDate,
    energy: 4,
    notes: '',
    highlights: [],
  };
  const [reflectionText, setReflectionText] = useState(currentEntry.notes || '');

  // Filter activities for selected date
  const filteredActivities = activities.filter(a => {
    const d = a.started_at.split('T')[0];
    return d === selectedDate;
  });

  const totalMinutes = filteredActivities.reduce((sum, a) => sum + (a.duration_min || 0), 0);

  // Calculate breakdown by category
  const categoryBreakdown = CATEGORIES.map(cat => {
    const mins = filteredActivities
      .filter(a => a.category === cat.id)
      .reduce((sum, a) => sum + (a.duration_min || 0), 0);
    const pct = totalMinutes > 0 ? Math.round((mins / totalMinutes) * 100) : 0;
    return {
      cat,
      mins,
      pct,
    };
  }).filter(c => c.mins > 0);

  const handleSaveReflection = async () => {
    await saveJournalEntry({
      date: selectedDate,
      notes: reflectionText,
    });
    showToast('Reflection Saved', 'Daily journal updated', 'success');
  };

  const handleSelectEnergy = async (val: number) => {
    await saveJournalEntry({
      date: selectedDate,
      energy: val,
    });
    showToast('Energy Logged', ENERGY_LEVELS.find(e => e.value === val)?.label, 'success');
  };

  const handleCreateActivity = async () => {
    if (!newTitle.trim()) return;
    const dur = parseInt(newDuration, 10) || 30;
    await addActivity({
      title: newTitle.trim(),
      category: newCategory,
      duration_min: dur,
    });
    showToast('Activity Logged', `${dur}m of ${newTitle.trim()}`, 'success');
    setNewTitle('');
    setIsAddingActivity(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>TIME RIVER</Text>
          <Text style={styles.headerTitle}>Day Journal</Text>
        </View>

        <TouchableOpacity
          style={styles.addActBtn}
          onPress={() => setIsAddingActivity(prev => !prev)}
          activeOpacity={0.8}
        >
          <CustomIcon name="plus" size={14} color="#070709" strokeWidth={2.5} />
          <Text style={styles.addActBtnText}>Log time</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Quick Add Activity Dropdown */}
        {isAddingActivity && (
          <View style={styles.addActCard}>
            <Text style={styles.cardHeaderLabel}>LOG PAST TIME</Text>
            <TextInput
              style={styles.inputField}
              placeholder="What did you work on?"
              placeholderTextColor="#6b7280"
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
            />

            <View style={styles.inputRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.smallLabel}>DURATION (MINS)</Text>
                <TextInput
                  style={styles.inputField}
                  keyboardType="numeric"
                  value={newDuration}
                  onChangeText={setNewDuration}
                />
              </View>
            </View>

            <Text style={styles.smallLabel}>CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {CATEGORIES.map(cat => {
                  const isSel = newCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.catPill,
                        isSel && { backgroundColor: `${cat.color}25`, borderColor: cat.color },
                      ]}
                      onPress={() => setNewCategory(cat.id)}
                    >
                      <Text>{cat.emoji}</Text>
                      <Text style={[styles.catPillText, isSel && { color: '#f3eee4' }]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.addActActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsAddingActivity(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveActBtn}
                onPress={handleCreateActivity}
              >
                <Text style={styles.saveActBtnText}>Save to Arc</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Daily Energy & Mood Check-In */}
        <View style={activeHighlightStep === 'journal' && styles.spotlightWrapper}>
          {activeHighlightStep === 'journal' && (
            <TourSpotlightBadge
              stepNumber={7}
              label="Time River & Mood"
              color="#bb9af7"
              direction="down"
            />
          )}
          <View style={[styles.card, activeHighlightStep === 'journal' && styles.highlightedCard]}>
            <Text style={styles.cardHeaderLabel}>HOW IS YOUR ENERGY TODAY?</Text>
            <View style={styles.energyRow}>
              {ENERGY_LEVELS.map(lvl => {
                const isSelected = currentEntry.energy === lvl.value;
                return (
                  <TouchableOpacity
                    key={lvl.value}
                    style={[
                      styles.energyBtn,
                      isSelected && styles.energyBtnSelected,
                    ]}
                    onPress={() => handleSelectEnergy(lvl.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.energyEmoji}>{lvl.emoji}</Text>
                    <Text
                      style={[
                        styles.energyLabel,
                        isSelected && styles.energyLabelSelected,
                      ]}
                    >
                      {lvl.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Daily Summary & Category Breakdown */}
        <View style={styles.card}>
          <View style={styles.summaryTopRow}>
            <View>
              <Text style={styles.cardHeaderLabel}>DAY DISTRIBUTION</Text>
              <Text style={styles.totalTimeText}>{formatMinutes(totalMinutes)}</Text>
            </View>
            <View style={styles.activitiesCountBadge}>
              <Text style={styles.activitiesCountText}>
                {filteredActivities.length} sessions
              </Text>
            </View>
          </View>

          {categoryBreakdown.length === 0 ? (
            <Text style={styles.emptyBreakdownText}>
              No activities logged for this day yet. Start a focus session to see your breakdown.
            </Text>
          ) : (
            <View style={styles.breakdownList}>
              {/* Stacked Progress Bar */}
              <View style={styles.stackedBar}>
                {categoryBreakdown.map(b => (
                  <View
                    key={b.cat.id}
                    style={{
                      flex: b.pct,
                      backgroundColor: b.cat.color,
                      height: '100%',
                    }}
                  />
                ))}
              </View>

              {/* Category Rows */}
              {categoryBreakdown.map(b => (
                <View key={b.cat.id} style={styles.breakdownRow}>
                  <View style={styles.breakdownCatName}>
                    <View style={[styles.colorDot, { backgroundColor: b.cat.color }]} />
                    <Text style={styles.breakdownLabel}>
                      {b.cat.emoji} {b.cat.label}
                    </Text>
                  </View>

                  <View style={styles.breakdownValues}>
                    <Text style={styles.breakdownMins}>{formatMinutes(b.mins)}</Text>
                    <Text style={styles.breakdownPct}>{b.pct}%</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Chronological Activity River */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderLabel}>ACTIVITY RIVER</Text>

          {filteredActivities.length === 0 ? (
            <View style={styles.emptyRiverBox}>
              <CustomIcon name="clock" size={28} color="#8a94a6" />
              <Text style={styles.emptyRiverText}>The river is quiet today.</Text>
            </View>
          ) : (
            <View style={styles.riverTimeline}>
              {filteredActivities.map((act, index) => {
                const cat = getCategory(act.category);
                const startTime = new Date(act.started_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const isLast = index === filteredActivities.length - 1;

                return (
                  <View key={act.id} style={styles.timelineItem}>
                    {/* Time Column */}
                    <View style={styles.timelineTimeCol}>
                      <Text style={styles.timelineTimeText}>{startTime}</Text>
                    </View>

                    {/* Timeline Node & Spine */}
                    <View style={styles.timelineSpineCol}>
                      <View
                        style={[
                          styles.timelineNode,
                          { backgroundColor: cat.color, borderColor: '#070709' },
                        ]}
                      />
                      {!isLast && <View style={styles.timelineSpine} />}
                    </View>

                    {/* Event Card */}
                    <View style={styles.timelineContentCard}>
                      <View style={styles.timelineCardHeader}>
                        <Text style={styles.timelineActTitle} numberOfLines={1}>
                          {act.title}
                        </Text>
                        <TouchableOpacity
                          onPress={async () => {
                            await deleteActivity(act.id);
                            showToast('Activity Deleted', act.title, 'info');
                          }}
                        >
                          <CustomIcon name="trash" size={13} color="#8a94a6" />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.timelineMetaRow}>
                        <View
                          style={[
                            styles.catBadge,
                            { backgroundColor: `${cat.color}20` },
                          ]}
                        >
                          <Text style={[styles.catBadgeText, { color: cat.color }]}>
                            {cat.label}
                          </Text>
                        </View>
                        <Text style={styles.timelineDurationText}>
                          {formatMinutes(act.duration_min)}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Daily Reflection Notes */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderLabel}>DAILY REFLECTION</Text>
          <Text style={styles.reflectionPrompt}>
            What went well? What got in the way? Any key takeaways?
          </Text>

          <TextInput
            style={styles.reflectionInput}
            placeholder="Write your thoughts..."
            placeholderTextColor="#6b7280"
            multiline
            numberOfLines={4}
            value={reflectionText}
            onChangeText={setReflectionText}
          />

          <TouchableOpacity
            style={styles.saveReflectionBtn}
            onPress={handleSaveReflection}
            activeOpacity={0.8}
          >
            <Text style={styles.saveReflectionText}>Save Reflection</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  addActBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#34d399',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addActBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#070709',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  spotlightWrapper: {
    marginHorizontal: 8,
    marginBottom: 8,
  },
  highlightedCard: {
    marginHorizontal: 0,
    marginBottom: 0,
    borderWidth: 2,
    borderColor: '#bb9af7',
    backgroundColor: 'rgba(187, 154, 247, 0.08)',
    shadowColor: '#bb9af7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 12,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorderSubtle,
    padding: 16,
  },
  cardHeaderLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#8a94a6',
    marginBottom: 12,
  },
  energyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  energyBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    flex: 1,
    marginHorizontal: 3,
  },
  energyBtnSelected: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderColor: '#34d399',
  },
  energyEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  energyLabel: {
    fontSize: 10,
    color: '#8a94a6',
    fontWeight: '500',
  },
  energyLabelSelected: {
    color: '#34d399',
    fontWeight: '700',
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  totalTimeText: {
    fontSize: 28,
    fontFamily: THEME.typography.serif,
    color: '#f3eee4',
  },
  activitiesCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  activitiesCountText: {
    fontSize: 11,
    color: '#8a94a6',
    fontWeight: '600',
  },
  emptyBreakdownText: {
    fontSize: 12,
    color: '#8a94a6',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  stackedBar: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  breakdownList: {
    gap: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownCatName: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#f3eee4',
  },
  breakdownValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  breakdownMins: {
    fontSize: 12,
    color: '#8a94a6',
  },
  breakdownPct: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f3eee4',
    width: 34,
    textAlign: 'right',
  },
  emptyRiverBox: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyRiverText: {
    fontSize: 13,
    color: '#8a94a6',
    fontStyle: 'italic',
  },
  riverTimeline: {
    marginTop: 6,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timelineTimeCol: {
    width: 60,
    paddingTop: 2,
  },
  timelineTimeText: {
    fontSize: 11,
    color: '#8a94a6',
    fontFamily: THEME.typography.mono,
  },
  timelineSpineCol: {
    alignItems: 'center',
    width: 24,
  },
  timelineNode: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  timelineSpine: {
    flex: 1,
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 4,
  },
  timelineContentCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    marginLeft: 6,
  },
  timelineCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineActTitle: {
    fontSize: 13,
    color: '#f3eee4',
    fontWeight: '500',
    flex: 1,
    paddingRight: 8,
  },
  timelineMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  catBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  timelineDurationText: {
    fontSize: 11,
    color: '#8a94a6',
  },
  reflectionPrompt: {
    fontSize: 12,
    color: '#8a94a6',
    marginBottom: 8,
  },
  reflectionInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    padding: 12,
    color: '#f3eee4',
    fontSize: 13,
    height: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  saveReflectionBtn: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveReflectionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#34d399',
  },
  addActCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#0f1713',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    padding: 16,
  },
  inputField: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#f3eee4',
    fontSize: 13,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  smallLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#8a94a6',
    marginBottom: 6,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  catPillText: {
    fontSize: 11,
    color: '#8a94a6',
  },
  addActActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelBtnText: {
    fontSize: 13,
    color: '#8a94a6',
  },
  saveActBtn: {
    backgroundColor: '#34d399',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  saveActBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#070709',
  },
});
