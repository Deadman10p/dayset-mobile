import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useData } from '../context/DataContext';
import { THEME, CATEGORIES } from '../constants/theme';
import { ActivityCategory } from '../types';
import { CustomIcon } from './CustomIcon';

export const FocusWidget: React.FC = () => {
  const {
    runningActivity,
    runningElapsedSeconds,
    startActivity,
    stopActivity,
    showToast,
  } = useData();

  const [focusTitle, setFocusTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory>('deep-work');

  const isRunning = !!runningActivity;

  // Format running elapsed time
  const formatSeconds = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggleFocus = async () => {
    if (isRunning) {
      const stopped = await stopActivity();
      if (stopped) {
        showToast(
          'Focus Completed',
          `Logged ${stopped.duration_min}m of ${stopped.category}`,
          'success'
        );
      }
    } else {
      const title = focusTitle.trim() || 'Focus Session';
      await startActivity(title, selectedCategory);
      setFocusTitle('');
      showToast('Focus Started', `${title} (${selectedCategory})`, 'success');
    }
  };

  // Ring dimensions
  const ringSize = 100;
  const strokeWidth = 5;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Progress loops every 25 mins (1500s) for pomodoro visual rhythm
  const progressRatio = isRunning ? (runningElapsedSeconds % 1500) / 1500 : 0;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>FOCUS</Text>

      {/* Radial Timer Dial */}
      <View style={styles.timerCenter}>
        <TouchableOpacity
          onPress={handleToggleFocus}
          activeOpacity={0.8}
          style={styles.circleBtn}
        >
          <Svg width={ringSize} height={ringSize}>
            {/* Background ring */}
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              stroke="rgba(243, 238, 228, 0.08)"
              strokeWidth={strokeWidth}
              fill="rgba(16, 26, 20, 0.8)"
            />
            {/* Animated progress ring */}
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              stroke={isRunning ? '#34d399' : 'rgba(52, 211, 153, 0.3)'}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={isRunning ? strokeDashoffset : circumference}
              strokeLinecap="round"
              fill="transparent"
              transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
            />
          </Svg>

          {/* Center Play/Stop Icon & Timer */}
          <View style={styles.innerContent}>
            {isRunning ? (
              <View style={styles.runningBadge}>
                <CustomIcon name="stop" size={18} color="#f43f5e" />
                <Text style={styles.elapsedText}>
                  {formatSeconds(runningElapsedSeconds)}
                </Text>
              </View>
            ) : (
              <CustomIcon name="play" size={24} color="#34d399" />
            )}
          </View>
        </TouchableOpacity>

        {isRunning && (
          <Text style={styles.activeTitleText} numberOfLines={1}>
            {runningActivity?.title}
          </Text>
        )}
      </View>

      {/* Focus input field (when not running) */}
      {!isRunning && (
        <TextInput
          style={styles.focusInput}
          placeholder="What are you focusing on?"
          placeholderTextColor="#6b7280"
          value={focusTitle}
          onChangeText={setFocusTitle}
        />
      )}

      {/* Category Pills */}
      {!isRunning && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryPill,
                  isSelected && {
                    backgroundColor: `${cat.color}25`,
                    borderColor: cat.color,
                  },
                ]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.catEmoji}>{cat.emoji}</Text>
                <Text
                  style={[
                    styles.catLabel,
                    isSelected && { color: '#f3eee4', fontWeight: '600' },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Start / Stop Button */}
      <TouchableOpacity
        style={[
          styles.actionBtn,
          isRunning ? styles.actionBtnStop : styles.actionBtnStart,
        ]}
        onPress={handleToggleFocus}
        activeOpacity={0.8}
      >
        <CustomIcon
          name={isRunning ? 'stop' : 'play'}
          size={16}
          color={isRunning ? '#ffffff' : '#070709'}
        />
        <Text
          style={[
            styles.actionBtnText,
            isRunning ? { color: '#ffffff' } : { color: '#070709' },
          ]}
        >
          {isRunning ? 'Stop focus & log activity' : 'Start focus'}
        </Text>
      </TouchableOpacity>
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
  cardTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.2,
    color: '#8a94a6',
    marginBottom: 10,
  },
  timerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  circleBtn: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  runningBadge: {
    alignItems: 'center',
    gap: 2,
  },
  elapsedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f3eee4',
    fontFamily: THEME.typography.mono,
  },
  activeTitleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#34d399',
    marginTop: 8,
    textAlign: 'center',
  },
  focusInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: THEME.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#f3eee4',
    marginBottom: 12,
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 14,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  catEmoji: {
    fontSize: 13,
  },
  catLabel: {
    fontSize: 12,
    color: '#8a94a6',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: THEME.radius.sm,
    paddingVertical: 12,
  },
  actionBtnStart: {
    backgroundColor: '#34d399',
  },
  actionBtnStop: {
    backgroundColor: '#f43f5e',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
