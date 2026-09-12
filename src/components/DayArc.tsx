import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Modal } from 'react-native';
import Svg, { Path, Line, Text as SvgText, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useData } from '../context/DataContext';
import { Activity, ActivityCategory } from '../types';
import { THEME, getCategory } from '../constants/theme';
import { CustomIcon } from './CustomIcon';
import { formatMinutes } from '../utils/parser';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SVG_WIDTH = Math.min(SCREEN_WIDTH - 28, 400);
const SVG_HEIGHT = SVG_WIDTH * 0.54; // Proportional semicircular height
const CX = SVG_WIDTH / 2;
const CY = SVG_HEIGHT * 0.88;
const RADIUS = SVG_WIDTH * 0.38;

interface DayArcProps {
  onQuickLogPress?: () => void;
}

export const DayArc: React.FC<DayArcProps> = ({ onQuickLogPress }) => {
  const { activities, runningActivity, deleteActivity, showToast } = useData();
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  // Current time in minutes from midnight (0 to 1440)
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Helper to map minutes (0..1440) to angle in radians for semicircle
  // 0m = 180° (left), 720m = 270° (top apex), 1440m = 360°/0° (right)
  const minuteToPoint = (min: number, r: number = RADIUS) => {
    const clamped = Math.max(0, Math.min(1440, min));
    const angleDeg = 180 + (clamped / 1440) * 180;
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: CX + r * Math.cos(rad),
      y: CY + r * Math.sin(rad),
    };
  };

  // Helper to create SVG arc path between two minute values
  const createArcPath = (startMin: number, endMin: number, r: number = RADIUS) => {
    const s = Math.max(0, Math.min(1440, startMin));
    const e = Math.max(0, Math.min(1440, endMin));
    if (e <= s) return '';
    const p1 = minuteToPoint(s, r);
    const p2 = minuteToPoint(e, r);
    const largeArc = e - s > 720 ? 1 : 0;
    return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  };

  // Filter activities that occurred today
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const parsedSegments = useMemo(() => {
    return activities
      .map(act => {
        const start = new Date(act.started_at);
        const end = act.ended_at ? new Date(act.ended_at) : now;
        if (start > todayEnd || end < todayStart) return null;

        const startMin = start < todayStart ? 0 : start.getHours() * 60 + start.getMinutes();
        const endMin = act.ended_at
          ? end.getHours() * 60 + end.getMinutes()
          : currentMinutes;

        const cat = getCategory(act.category);
        return {
          act,
          startMin,
          endMin: Math.max(startMin + 5, endMin),
          color: cat.color,
          isRunning: !act.ended_at,
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);
  }, [activities, currentMinutes]);

  // Current time point coordinates
  const currentPoint = minuteToPoint(currentMinutes, RADIUS);

  // Hour tick marks configuration: [0, 6, 12, 18, 24] major ticks, 1-hour minor ticks
  const hourTicks = useMemo(() => {
    const ticks = [];
    for (let h = 0; h <= 24; h++) {
      const min = h * 60;
      const isMajor = h % 6 === 0;
      const rInner = RADIUS - (isMajor ? 12 : 6);
      const rOuter = RADIUS + (isMajor ? 14 : 7);
      const pInner = minuteToPoint(min, rInner);
      const pOuter = minuteToPoint(min, rOuter);

      let label = '';
      if (h === 0) label = '12a';
      else if (h === 6) label = '6a';
      else if (h === 12) label = '12p';
      else if (h === 18) label = '6p';
      else if (h === 24) label = '12a';

      const pLabel = minuteToPoint(min, RADIUS + 24);

      ticks.push({
        h,
        isMajor,
        pInner,
        pOuter,
        pLabel,
        label,
      });
    }
    return ticks;
  }, []);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.subHeading}>YOUR DAY</Text>
          <Text style={styles.heading}>Twenty-four hours, one arc</Text>
        </View>
        <TouchableOpacity
          onPress={onQuickLogPress}
          activeOpacity={0.7}
          style={styles.headerBtn}
        >
          <CustomIcon name="plus" size={13} color="#34d399" />
          <Text style={styles.headerBtnText}>Log time</Text>
        </TouchableOpacity>
      </View>

      {/* SVG Arc Dial */}
      <View style={styles.svgContainer}>
        <Svg width={SVG_WIDTH} height={SVG_HEIGHT} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}>
          <Defs>
            {/* Emerald glow for elapsed time */}
            <LinearGradient id="emeraldProg" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#34d399" stopOpacity="0.25" />
              <Stop offset="100%" stopColor="#10b981" stopOpacity="0.85" />
            </LinearGradient>
          </Defs>

          {/* Background track (24 hours full arc) */}
          <Path
            d={createArcPath(0, 1440, RADIUS)}
            fill="none"
            stroke="rgba(243, 238, 228, 0.08)"
            strokeWidth={16}
            strokeLinecap="round"
          />

          {/* Elapsed day subtle background */}
          <Path
            d={createArcPath(0, currentMinutes, RADIUS)}
            fill="none"
            stroke="url(#emeraldProg)"
            strokeWidth={16}
            strokeLinecap="round"
          />

          {/* Activity segments painted on the arc */}
          {parsedSegments.map(seg => {
            const pathData = createArcPath(seg.startMin, seg.endMin, RADIUS);
            if (!pathData) return null;
            return (
              <G key={seg.act.id}>
                <Path
                  d={pathData}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={seg.isRunning ? 20 : 16}
                  strokeLinecap="round"
                  onPress={() => setSelectedActivity(seg.act)}
                />
              </G>
            );
          })}

          {/* Tick lines */}
          {hourTicks.map(t => (
            <G key={`tick-${t.h}`}>
              <Line
                x1={t.pInner.x}
                y1={t.pInner.y}
                x2={t.pOuter.x}
                y2={t.pOuter.y}
                stroke={t.isMajor ? 'rgba(243, 238, 228, 0.45)' : 'rgba(243, 238, 228, 0.15)'}
                strokeWidth={t.isMajor ? 2 : 1}
              />
              {t.label ? (
                <SvgText
                  x={t.pLabel.x}
                  y={t.pLabel.y + 4}
                  fill="#8a94a6"
                  fontSize="10"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {t.label}
                </SvgText>
              ) : null}
            </G>
          ))}

          {/* Current Time Indicator Bead & Glow */}
          <Circle
            cx={currentPoint.x}
            cy={currentPoint.y}
            r={14}
            fill="rgba(52, 211, 153, 0.25)"
          />
          <Circle
            cx={currentPoint.x}
            cy={currentPoint.y}
            r={7}
            fill="#34d399"
            stroke="#ffffff"
            strokeWidth={2}
          />
        </Svg>
      </View>

      {/* Footer / Activities list or empty hint */}
      <View style={styles.footerRow}>
        {parsedSegments.length > 0 ? (
          <View style={styles.chipsRow}>
            {parsedSegments.slice(0, 3).map(s => {
              const cat = getCategory(s.act.category);
              return (
                <TouchableOpacity
                  key={s.act.id}
                  style={[styles.activityPill, { borderColor: `${cat.color}40` }]}
                  onPress={() => setSelectedActivity(s.act)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.pillDot, { backgroundColor: cat.color }]} />
                  <Text style={styles.pillText} numberOfLines={1}>
                    {s.act.title} · {formatMinutes(s.act.duration_min || 1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {parsedSegments.length > 3 && (
              <View style={styles.morePill}>
                <Text style={styles.morePillText}>+{parsedSegments.length - 3}</Text>
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.hintText}>Log or start an activity to paint the arc</Text>
        )}
      </View>

      {/* Activity Details Modal */}
      {selectedActivity && (
        <Modal
          visible={!!selectedActivity}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedActivity(null)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setSelectedActivity(null)}
          >
            <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  <Text style={styles.modalEmoji}>
                    {getCategory(selectedActivity.category).emoji}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalCategory}>
                      {getCategory(selectedActivity.category).label.toUpperCase()}
                    </Text>
                    <Text style={styles.modalTitle}>{selectedActivity.title}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setSelectedActivity(null)}>
                  <CustomIcon name="close" size={20} color="#8a94a6" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalInfoBox}>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Duration</Text>
                  <Text style={styles.modalInfoVal}>
                    {formatMinutes(selectedActivity.duration_min)}
                  </Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Started</Text>
                  <Text style={styles.modalInfoVal}>
                    {new Date(selectedActivity.started_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                {selectedActivity.notes ? (
                  <View style={styles.modalNotesBox}>
                    <Text style={styles.modalNotesText}>{selectedActivity.notes}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalDeleteBtn}
                  onPress={async () => {
                    await deleteActivity(selectedActivity.id);
                    setSelectedActivity(null);
                    showToast('Activity Removed', selectedActivity.title, 'info');
                  }}
                >
                  <CustomIcon name="trash" size={16} color="#f43f5e" />
                  <Text style={styles.modalDeleteText}>Delete from day log</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
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
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  subHeading: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.2,
    color: '#8a94a6',
    marginBottom: 3,
  },
  heading: {
    fontSize: 20,
    fontFamily: THEME.typography.serif,
    color: '#f3eee4',
  },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  headerBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34d399',
  },
  svgContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  footerRow: {
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 10,
  },
  hintText: {
    fontSize: 12,
    color: '#8a94a6',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  activityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderRadius: 9999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    maxWidth: '48%',
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  pillText: {
    fontSize: 11,
    color: '#f3eee4',
  },
  morePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  morePillText: {
    fontSize: 11,
    color: '#8a94a6',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0f1713',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.25)',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  modalEmoji: {
    fontSize: 24,
  },
  modalCategory: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#8a94a6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f3eee4',
    marginTop: 2,
  },
  modalInfoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 16,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalInfoLabel: {
    fontSize: 13,
    color: '#8a94a6',
  },
  modalInfoVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f3eee4',
  },
  modalNotesBox: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 8,
    marginTop: 4,
  },
  modalNotesText: {
    fontSize: 12,
    color: '#d1cdc4',
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
  },
  modalDeleteText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f43f5e',
  },
});
