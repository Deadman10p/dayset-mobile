import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { THEME } from '../constants/theme';
import { CustomIcon } from './CustomIcon';

interface TourStep {
  title: string;
  tagline: string;
  body: string;
  icon: 'sun' | 'checkbox' | 'bell' | 'mic' | 'plug';
  color: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Your day as an arc',
    tagline: 'TWENTY-FOUR HOURS, ONE ARC',
    body: 'Twenty-four hours, filled as they pass. Logged activities glow as coloured segments along the semicircular dial — tap any segment for details or quick deletion.',
    icon: 'sun',
    color: '#34d399',
  },
  {
    title: 'On your plate',
    tagline: 'SWIPE OR TAP TO CLEAR',
    body: 'Everything due today and overdue. Tap check to complete with satisfaction, or snooze to tomorrow morning with a single touch.',
    icon: 'checkbox',
    color: '#f2c85b',
  },
  {
    title: 'Reminders in orbit',
    tagline: 'TIME AS DISTANCE',
    body: 'Closer to the centre means sooner. Never lose track of urgent deadlines with audio notifications and countdown timers.',
    icon: 'bell',
    color: '#ff9f5a',
  },
  {
    title: 'Talk to Ledger',
    tagline: 'VOICE-TO-VOICE ASSISTANT',
    body: 'Tap the holographic orb and speak. Ledger manages your plate, starts focus sessions, tracks deep work, and speaks back with answers.',
    icon: 'mic',
    color: '#34d399',
  },
  {
    title: 'Bridge to agents',
    tagline: 'MODEL CONTEXT PROTOCOL (MCP)',
    body: 'Generate your personal access token to let Claude Code, Cursor, Pi, and Hermes read and write your ledger via 12 MCP tools.',
    icon: 'plug',
    color: '#7aa2f7',
  },
];

interface TourModalProps {
  visible: boolean;
  onClose: () => void;
}

export const TourModal: React.FC<TourModalProps> = ({ visible, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const step = TOUR_STEPS[currentStepIndex];
  const isLast = currentStepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      setCurrentStepIndex(0);
      onClose();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header with step pill & close */}
          <View style={styles.header}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>
                Step {currentStepIndex + 1} of {TOUR_STEPS.length}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <CustomIcon name="close" size={20} color="#8a94a6" />
            </TouchableOpacity>
          </View>

          {/* Icon Circle */}
          <View style={[styles.iconCircle, { borderColor: `${step.color}50`, backgroundColor: `${step.color}15` }]}>
            <CustomIcon name={step.icon} size={32} color={step.color} strokeWidth={2} />
          </View>

          {/* Text Content */}
          <Text style={styles.tagline}>{step.tagline}</Text>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.body}>{step.body}</Text>

          {/* Dots Indicator */}
          <View style={styles.dotsRow}>
            {TOUR_STEPS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === currentStepIndex && { backgroundColor: step.color, width: 22 },
                ]}
              />
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            {currentStepIndex > 0 ? (
              <TouchableOpacity style={styles.prevBtn} onPress={handlePrev}>
                <Text style={styles.prevBtnText}>Back</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ flex: 1 }} />
            )}

            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: step.color }]}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={styles.nextBtnText}>{isLast ? 'Get started' : 'Continue'}</Text>
              <CustomIcon name="arrow-right" size={15} color="#070709" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0c1410',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
    padding: 24,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8a94a6',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  tagline: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#8a94a6',
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontFamily: THEME.typography.serif,
    color: '#f3eee4',
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    fontSize: 14,
    color: '#d1cdc4',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 24,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  actionsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prevBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  prevBtnText: {
    fontSize: 14,
    color: '#8a94a6',
    fontWeight: '600',
  },
  nextBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
  },
  nextBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#070709',
  },
});
