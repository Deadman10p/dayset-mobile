import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';

export type IconName =
  | 'sun'
  | 'checkbox'
  | 'book'
  | 'bell'
  | 'mic'
  | 'plug'
  | 'settings'
  | 'sparkles'
  | 'plus'
  | 'play'
  | 'pause'
  | 'stop'
  | 'check'
  | 'clock'
  | 'calendar'
  | 'chevron-right'
  | 'chevron-down'
  | 'arrow-right'
  | 'trash'
  | 'snooze'
  | 'search'
  | 'close'
  | 'copy'
  | 'terminal'
  | 'cpu'
  | 'refresh'
  | 'help'
  | 'user'
  | 'star';

interface CustomIconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const CustomIcon: React.FC<CustomIconProps> = ({
  name,
  size = 20,
  color = '#f3eee4',
  strokeWidth = 2,
}) => {
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'sun':
      return (
        <Svg {...commonProps}>
          <Circle cx="12" cy="12" r="4" />
          <Path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </Svg>
      );
    case 'checkbox':
      return (
        <Svg {...commonProps}>
          <Polyline points="9 11 12 14 22 4" />
          <Path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </Svg>
      );
    case 'book':
      return (
        <Svg {...commonProps}>
          <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </Svg>
      );
    case 'bell':
      return (
        <Svg {...commonProps}>
          <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </Svg>
      );
    case 'mic':
      return (
        <Svg {...commonProps}>
          <Path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <Path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <Line x1="12" y1="19" x2="12" y2="23" />
          <Line x1="8" y1="23" x2="16" y2="23" />
        </Svg>
      );
    case 'plug':
      return (
        <Svg {...commonProps}>
          <Path d="M12 22v-5" />
          <Path d="M9 8V2" />
          <Path d="M15 2v6" />
          <Path d="M18 8v5a6 6 0 0 1-12 0V8h12z" />
        </Svg>
      );
    case 'settings':
      return (
        <Svg {...commonProps}>
          <Circle cx="12" cy="12" r="3" />
          <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </Svg>
      );
    case 'sparkles':
      return (
        <Svg {...commonProps}>
          <Path d="M12 2l2.4 5 5 2.4-5 2.4-2.4 5-2.4-5-5-2.4 5-2.4L12 2z" />
          <Path d="M19 16l1.2 2.5 2.5 1.2-2.5 1.2L19 23l-1.2-2.5-2.5-1.2 2.5-1.2L19 16z" />
        </Svg>
      );
    case 'plus':
      return (
        <Svg {...commonProps}>
          <Line x1="12" y1="5" x2="12" y2="19" />
          <Line x1="5" y1="12" x2="19" y2="12" />
        </Svg>
      );
    case 'play':
      return (
        <Svg {...commonProps} fill={color}>
          <Polyline points="5 3 19 12 5 21 5 3" />
        </Svg>
      );
    case 'pause':
      return (
        <Svg {...commonProps} fill={color}>
          <Rect x="6" y="4" width="4" height="16" />
          <Rect x="14" y="4" width="4" height="16" />
        </Svg>
      );
    case 'stop':
      return (
        <Svg {...commonProps} fill={color}>
          <Rect x="5" y="5" width="14" height="14" rx="2" />
        </Svg>
      );
    case 'check':
      return (
        <Svg {...commonProps}>
          <Polyline points="20 6 9 17 4 12" />
        </Svg>
      );
    case 'clock':
      return (
        <Svg {...commonProps}>
          <Circle cx="12" cy="12" r="10" />
          <Polyline points="12 6 12 12 16 14" />
        </Svg>
      );
    case 'calendar':
      return (
        <Svg {...commonProps}>
          <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <Line x1="16" y1="2" x2="16" y2="6" />
          <Line x1="8" y1="2" x2="8" y2="6" />
          <Line x1="3" y1="10" x2="21" y2="10" />
        </Svg>
      );
    case 'chevron-right':
      return (
        <Svg {...commonProps}>
          <Polyline points="9 18 15 12 9 6" />
        </Svg>
      );
    case 'chevron-down':
      return (
        <Svg {...commonProps}>
          <Polyline points="6 9 12 15 18 9" />
        </Svg>
      );
    case 'arrow-right':
      return (
        <Svg {...commonProps}>
          <Line x1="5" y1="12" x2="19" y2="12" />
          <Polyline points="12 5 19 12 12 19" />
        </Svg>
      );
    case 'trash':
      return (
        <Svg {...commonProps}>
          <Polyline points="3 6 5 6 21 6" />
          <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </Svg>
      );
    case 'snooze':
      return (
        <Svg {...commonProps}>
          <Path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
          <Polyline points="16 6 12 2 8 6" />
          <Line x1="12" y1="2" x2="12" y2="15" />
        </Svg>
      );
    case 'search':
      return (
        <Svg {...commonProps}>
          <Circle cx="11" cy="11" r="8" />
          <Line x1="21" y1="21" x2="16.65" y2="16.65" />
        </Svg>
      );
    case 'close':
      return (
        <Svg {...commonProps}>
          <Line x1="18" y1="6" x2="6" y2="18" />
          <Line x1="6" y1="6" x2="18" y2="18" />
        </Svg>
      );
    case 'copy':
      return (
        <Svg {...commonProps}>
          <Rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </Svg>
      );
    case 'terminal':
      return (
        <Svg {...commonProps}>
          <Polyline points="4 17 10 11 4 5" />
          <Line x1="12" y1="19" x2="20" y2="19" />
        </Svg>
      );
    case 'cpu':
      return (
        <Svg {...commonProps}>
          <Rect x="4" y="4" width="16" height="16" rx="2" />
          <Rect x="9" y="9" width="6" height="6" />
          <Line x1="9" y1="1" x2="9" y2="4" />
          <Line x1="15" y1="1" x2="15" y2="4" />
          <Line x1="9" y1="20" x2="9" y2="23" />
          <Line x1="15" y1="20" x2="15" y2="23" />
          <Line x1="20" y1="9" x2="23" y2="9" />
          <Line x1="20" y1="14" x2="23" y2="14" />
          <Line x1="1" y1="9" x2="4" y2="9" />
          <Line x1="1" y1="14" x2="4" y2="14" />
        </Svg>
      );
    case 'refresh':
      return (
        <Svg {...commonProps}>
          <Polyline points="23 4 23 10 17 10" />
          <Path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </Svg>
      );
    case 'help':
      return (
        <Svg {...commonProps}>
          <Circle cx="12" cy="12" r="10" />
          <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <Line x1="12" y1="17" x2="12.01" y2="17" />
        </Svg>
      );
    case 'user':
      return (
        <Svg {...commonProps}>
          <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <Circle cx="12" cy="7" r="4" />
        </Svg>
      );
    case 'star':
      return (
        <Svg {...commonProps} fill={color}>
          <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </Svg>
      );
    default:
      return null;
  }
};
