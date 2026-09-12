import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { CustomIcon } from './CustomIcon';

interface TourSpotlightBadgeProps {
  label: string;
  stepNumber: number;
  totalSteps?: number;
  color?: string;
  direction?: 'down' | 'up';
}

export const TourSpotlightBadge: React.FC<TourSpotlightBadgeProps> = ({
  label,
  stepNumber,
  totalSteps = 9,
  color = '#34d399',
  direction = 'down',
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );

    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: direction === 'down' ? 4 : -4,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    bounce.start();

    return () => {
      pulse.stop();
      bounce.stop();
    };
  }, [pulseAnim, bounceAnim, direction]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.badge,
          {
            backgroundColor: 'rgba(7, 12, 10, 0.95)',
            borderColor: color,
            transform: [{ translateY: bounceAnim }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: color, transform: [{ scale: pulseAnim }] },
          ]}
        />
        <Text style={[styles.stepText, { color }]}>
          STEP {stepNumber}/{totalSteps}
        </Text>
        <Text style={styles.sepText}>·</Text>
        <Text style={styles.labelText}>{label.toUpperCase()}</Text>
        <CustomIcon
          name={direction === 'down' ? 'chevron-down' : 'chevron-down'}
          size={12}
          color={color}
          strokeWidth={3}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    zIndex: 999,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  stepText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  sepText: {
    fontSize: 11,
    color: '#8a94a6',
  },
  labelText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#f3eee4',
  },
});
