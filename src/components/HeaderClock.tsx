import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useData } from '../context/DataContext';
import { THEME } from '../constants/theme';
import { formatMinutes } from '../utils/parser';

interface HeaderClockProps {
  onPressProfile?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const HeaderClock: React.FC<HeaderClockProps> = ({ onPressProfile }) => {
  const { settings, stats } = useData();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format date string: "SATURDAY, SEPTEMBER 12, 2026"
  const dateFormatted = time
    .toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
    .toUpperCase();

  // Time components
  let hours = time.getHours();
  const meridiem = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  // Dynamic greeting based on time of day
  const currentHour = time.getHours();
  let greeting = 'Good morning';
  if (currentHour >= 12 && currentHour < 17) greeting = 'Good afternoon';
  if (currentHour >= 17 && currentHour < 22) greeting = 'Good evening';
  if (currentHour >= 22 || currentHour < 5) greeting = 'Night owls';

  const isSmallScreen = SCREEN_WIDTH < 375;

  return (
    <View style={styles.container}>
      {/* Top row: Date & Greeting on left, Luxury Clock Widget on right */}
      <View style={styles.topRow}>
        <View style={styles.dateCol}>
          <Text style={styles.dateText}>{dateFormatted}</Text>
          <Text style={[styles.greetingText, isSmallScreen && { fontSize: 24, lineHeight: 28 }]}>
            {greeting},
          </Text>
          <TouchableOpacity onPress={onPressProfile} activeOpacity={0.8}>
            <Text
              style={[
                styles.userNameText,
                isSmallScreen && { fontSize: 26, lineHeight: 30 },
              ]}
              numberOfLines={1}
            >
              {settings.userName}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Enhanced Luxury Clock Glass Badge */}
        <View style={styles.clockCard}>
          <View style={styles.clockGlowHaze} />
          <View style={styles.clockTimeRow}>
            <Text style={[styles.clockMain, isSmallScreen && { fontSize: 34 }]}>
              {hours}:{minutes}
            </Text>
            <View style={styles.secondsCol}>
              <View style={styles.secondsBadge}>
                <Text style={styles.secondsText}>{seconds}</Text>
                <Text style={styles.secondsUnit}>s</Text>
              </View>
              <Text style={styles.meridiemText}>{meridiem}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Stats Badges row */}
      <View style={styles.pillsRow}>
        <View style={styles.pill}>
          <Text style={styles.pillCount}>{stats.plateCount}</Text>
          <Text style={styles.pillLabel}> on your plate</Text>
        </View>

        <View style={styles.pill}>
          <Text style={styles.pillCount}>{stats.doneTodayCount}</Text>
          <Text style={styles.pillLabel}> done today</Text>
        </View>

        <View style={styles.pill}>
          <Text style={styles.pillCount}>{formatMinutes(stats.loggedMinutesToday)}</Text>
          <Text style={styles.pillLabel}> logged</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  dateCol: {
    flex: 1,
    paddingRight: 4,
  },
  dateText: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#8a94a6',
    marginBottom: 4,
  },
  greetingText: {
    fontSize: 28,
    fontFamily: THEME.typography.serif,
    color: '#f3eee4',
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  userNameText: {
    fontSize: 30,
    fontFamily: THEME.typography.serif,
    fontStyle: 'italic',
    color: '#34d399',
    letterSpacing: -0.5,
    lineHeight: 34,
    // Radiant emerald glow
    textShadowColor: 'rgba(52, 211, 153, 0.75)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  clockCard: {
    position: 'relative',
    backgroundColor: 'rgba(16, 24, 20, 0.85)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#34d399',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  clockGlowHaze: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
  },
  clockTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clockMain: {
    fontSize: 40,
    fontFamily: THEME.typography.serif,
    color: '#f3eee4',
    fontWeight: '300',
    letterSpacing: -1,
  },
  secondsCol: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 2,
  },
  secondsBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  secondsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34d399',
    fontFamily: THEME.typography.mono,
  },
  secondsUnit: {
    fontSize: 9,
    color: '#8a94a6',
    marginLeft: 2,
  },
  meridiemText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8a94a6',
    letterSpacing: 1.2,
    paddingLeft: 2,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4.5,
  },
  pillCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f3eee4',
  },
  pillLabel: {
    fontSize: 11.5,
    color: '#8a94a6',
  },
});
