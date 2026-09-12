import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../constants/theme';
import { CustomIcon } from './CustomIcon';
import { useData } from '../context/DataContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface TourStep {
  id: string;
  tab: 'today' | 'todos' | 'voice' | 'journal' | 'agents' | 'settings';
  targetLabel: string;
  title: string;
  body: string;
  actionButtonLabel?: string;
  color: string;
  position: 'top' | 'bottom';
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'clock',
    tab: 'today',
    targetLabel: 'LIVING CHRONOMETER',
    title: 'Your day in real time',
    body: 'The live chronometer tracks seconds in glowing emerald alongside your personalized greeting and plate badges. It stays alive in real time.',
    actionButtonLabel: '🕒 Test Clock Pulse',
    color: '#34d399',
    position: 'bottom', // Clock is at top, tour card at bottom -> Both visible!
  },
  {
    id: 'omnibar',
    tab: 'today',
    targetLabel: 'OMNIBAR CAPTURE',
    title: 'Type plain English, get structure',
    body: 'Natural language parsing recognizes !urgent, !high, tags like #work, and relative times like "tomorrow 9am" immediately.',
    actionButtonLabel: '✨ Autofill Sample Command',
    color: '#f2c85b',
    position: 'bottom', // Omnibar is at upper-middle, tour card at bottom -> Both visible!
  },
  {
    id: 'arc',
    tab: 'today',
    targetLabel: '24-HOUR LIVING ARC',
    title: 'Twenty-four hours, one arc',
    body: 'The semicircular dial maps the entire 24-hour day. As you log work, colorful segments paint the dial and the beacon tracks where you are now.',
    actionButtonLabel: '🎨 Paint Arc (+45m Deep Work)',
    color: '#34d399',
    position: 'bottom', // Arc is in upper view, tour card at bottom -> Both visible!
  },
  {
    id: 'plate',
    tab: 'today',
    targetLabel: 'ON YOUR PLATE',
    title: 'Due today & overdue',
    body: 'Everything demanding your attention right now. Tap the checkbox to complete with celebratory satisfaction, or snooze to delay until tomorrow.',
    actionButtonLabel: '✓ Complete Top Task',
    color: '#f43f5e',
    position: 'top', // Plate scrolled into view below, tour card at top -> Both visible!
  },
  {
    id: 'focus',
    tab: 'today',
    targetLabel: 'FOCUS TIMER',
    title: 'Deep work radial dial',
    body: 'Pick a category like 🎯 Deep work or 🗣️ Meetings. The ring pulses while you focus and automatically logs completed time onto your arc.',
    actionButtonLabel: '▶ Start Focus Session',
    color: '#7aa2f7',
    position: 'top', // Focus widget scrolled into view below, tour card at top -> Both visible!
  },
  {
    id: 'board',
    tab: 'todos',
    targetLabel: 'KANBAN & LIST BOARD',
    title: 'Organize by priority rank',
    body: 'Switch between List and Kanban columns grouped by Urgent, High, Medium, and Low. Filter by tags or due dates.',
    actionButtonLabel: '📋 Explore Task Columns',
    color: '#ff9f5a',
    position: 'bottom', // Board view at top, tour card at bottom -> Both visible!
  },
  {
    id: 'journal',
    tab: 'journal',
    targetLabel: 'TIME RIVER & JOURNAL',
    title: 'Where the hours went',
    body: 'Log your energy from 😩 Drained to 🤩 Energised. View category percentage distributions and write daily reflection notes.',
    actionButtonLabel: '🤩 Log Energised Mood',
    color: '#bb9af7',
    position: 'bottom', // Energy & river at top, tour card at bottom -> Both visible!
  },
  {
    id: 'voice',
    tab: 'voice',
    targetLabel: 'TALK TO LEDGER',
    title: 'Voice-to-voice assistant',
    body: 'Tap the holographic orb and speak. Ledger manages your plate, starts focus sessions, tracks deep work, and speaks back.',
    actionButtonLabel: '🎙️ Ask "What is on my plate?"',
    color: '#34d399',
    position: 'bottom', // Orb in center, tour card at bottom -> Both visible!
  },
  {
    id: 'mcp',
    tab: 'agents',
    targetLabel: 'MCP AGENT HARNESS',
    title: 'Bridge to Claude & Cursor',
    body: 'Your personal access token connects Claude Code, Cursor, and Hermes via 12 MCP tools. Agents can read and write your ledger.',
    actionButtonLabel: '⚡ Simulate MCP Tool Call',
    color: '#7aa2f7',
    position: 'bottom', // Token & snippet at top, tour card at bottom -> Both visible!
  },
];

interface InteractiveTourProps {
  visible: boolean;
  stepIndex: number;
  onClose: () => void;
  onStepChange: (index: number) => void;
  onSwitchTab: (tab: TourStep['tab']) => void;
  onTriggerAutofill?: (text: string) => void;
}

export const InteractiveTour: React.FC<InteractiveTourProps> = ({
  visible,
  stepIndex,
  onClose,
  onStepChange,
  onSwitchTab,
  onTriggerAutofill,
}) => {
  const insets = useSafeAreaInsets();
  const {
    todos,
    completeTodo,
    addActivity,
    startActivity,
    saveJournalEntry,
    logEvent,
    showToast,
  } = useData();

  if (!visible) return null;

  const currentStep = TOUR_STEPS[stepIndex] || TOUR_STEPS[0];
  const isLast = stepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onSwitchTab('today');
      onClose();
      showToast('Tour Complete!', 'You are ready to command DaySet', 'success');
    } else {
      const nextIdx = stepIndex + 1;
      onStepChange(nextIdx);
      onSwitchTab(TOUR_STEPS[nextIdx].tab);
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      const prevIdx = stepIndex - 1;
      onStepChange(prevIdx);
      onSwitchTab(TOUR_STEPS[prevIdx].tab);
    }
  };

  const handleInteractiveAction = async () => {
    switch (currentStep.id) {
      case 'clock':
        showToast('Chronometer Active', 'DaySet clock is ticking live in real time', 'success');
        break;

      case 'omnibar':
        onSwitchTab('today');
        onTriggerAutofill?.('Finish quarterly report tomorrow !high #work');
        showToast('Autofilled Command', 'Notice the tags and priority light up!', 'info');
        break;

      case 'arc':
        onSwitchTab('today');
        await addActivity({
          title: 'Deep Work: System Architecture',
          category: 'deep-work',
          duration_min: 45,
        });
        showToast('Arc Painted!', 'Added 45m Deep Work segment to dial', 'success');
        break;

      case 'plate':
        onSwitchTab('today');
        const openTask = todos.find(t => t.status === 'open');
        if (openTask) {
          await completeTodo(openTask.id);
          showToast('Task Cleared!', openTask.title, 'success');
        } else {
          showToast('Plate Clear', 'No open tasks at the moment', 'info');
        }
        break;

      case 'focus':
        onSwitchTab('today');
        await startActivity('Deep Focus Sprint', 'deep-work');
        showToast('Focus Active!', 'Watch the radial ring pulse', 'success');
        break;

      case 'board':
        onSwitchTab('todos');
        showToast('Board Active', 'Cards grouped by urgency rank', 'info');
        break;

      case 'journal':
        onSwitchTab('journal');
        const todayStr = new Date().toISOString().split('T')[0];
        await saveJournalEntry({ date: todayStr, energy: 5 });
        showToast('Energised (5/5)', 'Saved to daily reflection ledger', 'success');
        break;

      case 'voice':
        onSwitchTab('voice');
        showToast('Ledger Responding', 'Querying plate status for you...', 'info');
        break;

      case 'mcp':
        onSwitchTab('agents');
        await logEvent('mcp_tool_call', 'Agent executed list_todos()', 'agent');
        showToast('MCP Tool Executed', 'Agent audit log updated', 'success');
        break;
    }
  };

  const isPositionTop = currentStep.position === 'top';

  return (
    <View style={styles.fullscreenOverlay} pointerEvents="box-none">
      {/* Floating Tour Mini Card - Positioned intelligently at top or bottom so highlighted element is NEVER covered */}
      <View
        style={[
          styles.guideCard,
          isPositionTop
            ? { top: insets.top + 8, bottom: undefined }
            : { bottom: insets.bottom + 65, top: undefined },
          { borderColor: currentStep.color },
        ]}
      >
        {/* Step Indicator & Header */}
        <View style={styles.cardHeader}>
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.targetDot,
                { backgroundColor: currentStep.color },
              ]}
            />
            <Text style={styles.targetLabel}>{currentStep.targetLabel}</Text>
          </View>

          <View style={styles.progressCounter}>
            <Text style={styles.progressText}>
              {stepIndex + 1} / {TOUR_STEPS.length}
            </Text>
            <TouchableOpacity
              onPress={() => {
                onSwitchTab('today');
                onClose();
              }}
              style={styles.closeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <CustomIcon name="close" size={16} color="#8a94a6" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Step Progress Line */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${((stepIndex + 1) / TOUR_STEPS.length) * 100}%`,
                backgroundColor: currentStep.color,
              },
            ]}
          />
        </View>

        {/* Title & Body */}
        <Text style={styles.stepTitle}>{currentStep.title}</Text>
        <Text style={styles.stepBody} numberOfLines={3}>
          {currentStep.body}
        </Text>

        {/* Interactive "Try it now" Action Button */}
        {currentStep.actionButtonLabel && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: `${currentStep.color}20`,
                borderColor: currentStep.color,
              },
            ]}
            onPress={handleInteractiveAction}
            activeOpacity={0.8}
          >
            <CustomIcon name="sparkles" size={13} color={currentStep.color} />
            <Text style={[styles.actionButtonText, { color: currentStep.color }]}>
              {currentStep.actionButtonLabel}
            </Text>
          </TouchableOpacity>
        )}

        {/* Navigation Controls */}
        <View style={styles.controlsRow}>
          {stepIndex > 0 ? (
            <TouchableOpacity style={styles.prevBtn} onPress={handlePrev}>
              <Text style={styles.prevBtnText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.prevBtn}
              onPress={() => {
                onSwitchTab('today');
                onClose();
              }}
            >
              <Text style={styles.prevBtnText}>Skip tour</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: currentStep.color }]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextBtnText}>
              {isLast ? 'Finish tour' : 'Next step'}
            </Text>
            <CustomIcon
              name="arrow-right"
              size={13}
              color="#070709"
              strokeWidth={3}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullscreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  guideCard: {
    position: 'absolute',
    left: 14,
    right: 14,
    maxWidth: 480,
    backgroundColor: 'rgba(10, 16, 13, 0.97)',
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.75,
    shadowRadius: 20,
    elevation: 25,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  targetDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  targetLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 1.8,
    color: '#8a94a6',
  },
  progressCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8a94a6',
    fontFamily: THEME.typography.mono,
  },
  closeBtn: {
    padding: 4,
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  stepTitle: {
    fontSize: 16,
    fontFamily: THEME.typography.serif,
    color: '#f3eee4',
    marginBottom: 3,
  },
  stepBody: {
    fontSize: 12,
    color: '#d1cdc4',
    lineHeight: 16.5,
    marginBottom: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  prevBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  prevBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#8a94a6',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 9999,
  },
  nextBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#070709',
  },
});
