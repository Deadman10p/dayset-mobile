import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface AuroraProps {
  glowColor?: 'emerald' | 'amber';
}

export const AuroraBackground: React.FC<AuroraProps> = ({ glowColor = 'emerald' }) => {
  const isAmber = glowColor === 'amber';

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* Base deep background */}
      <View style={[styles.baseBg]} />

      {/* Primary Aurora Blob - Top Left Glow */}
      <View
        style={[
          styles.blob,
          styles.blobTopLeft,
          {
            backgroundColor: isAmber ? 'rgba(217, 119, 6, 0.18)' : 'rgba(16, 185, 129, 0.15)',
          },
        ]}
      />

      {/* Secondary Aurora Blob - Top Center Glow */}
      <View
        style={[
          styles.blob,
          styles.blobTopCenter,
          {
            backgroundColor: isAmber ? 'rgba(245, 158, 11, 0.12)' : 'rgba(5, 150, 105, 0.12)',
          },
        ]}
      />

      {/* Tertiary Aurora Blob - Right Sun / Radial Aura */}
      <View
        style={[
          styles.blob,
          styles.blobRight,
          {
            backgroundColor: isAmber ? 'rgba(251, 191, 36, 0.22)' : 'rgba(52, 211, 153, 0.10)',
          },
        ]}
      />

      {/* Bottom subtle ambient haze */}
      <View
        style={[
          styles.blob,
          styles.blobBottom,
          {
            backgroundColor: isAmber ? 'rgba(180, 83, 9, 0.08)' : 'rgba(6, 78, 59, 0.12)',
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  baseBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#070709',
  },
  blob: {
    position: 'absolute',
    borderRadius: 9999,
  },
  blobTopLeft: {
    top: -120,
    left: -100,
    width: width * 0.9,
    height: width * 0.9,
    opacity: 0.75,
  },
  blobTopCenter: {
    top: 40,
    left: width * 0.1,
    width: width * 0.8,
    height: 300,
    opacity: 0.6,
  },
  blobRight: {
    top: 150,
    right: -120,
    width: width * 0.85,
    height: width * 0.85,
    opacity: 0.55,
  },
  blobBottom: {
    bottom: -150,
    left: width * 0.05,
    width: width * 0.9,
    height: 380,
    opacity: 0.45,
  },
});
