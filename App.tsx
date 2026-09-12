import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';

import { DataProvider, useData } from './src/context/DataContext';
import { AuroraBackground } from './src/components/AuroraBackground';
import { CustomIcon, IconName } from './src/components/CustomIcon';
import { TodayScreen } from './src/screens/TodayScreen';
import { TodosScreen } from './src/screens/TodosScreen';
import { JournalScreen } from './src/screens/JournalScreen';
import { VoiceScreen } from './src/screens/VoiceScreen';
import { IntegrationsScreen } from './src/screens/IntegrationsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { InteractiveTour, TourStep } from './src/components/InteractiveTour';
import { THEME } from './src/constants/theme';

type TabKey = 'today' | 'todos' | 'voice' | 'journal' | 'agents' | 'settings';

interface TabItem {
  key: TabKey;
  label: string;
  icon: IconName;
}

const TABS: TabItem[] = [
  { key: 'today', label: 'Today', icon: 'sun' },
  { key: 'todos', label: 'Plate', icon: 'checkbox' },
  { key: 'voice', label: 'Ledger', icon: 'mic' },
  { key: 'journal', label: 'Journal', icon: 'book' },
  { key: 'agents', label: 'Agents', icon: 'plug' },
  { key: 'settings', label: 'Settings', icon: 'settings' },
];

function MainAppContent() {
  const insets = useSafeAreaInsets();
  const { toast, hideToast, stats, runningActivity } = useData();
  const [activeTab, setActiveTab] = useState<TabKey>('today');
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [tourVisible, setTourVisible] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const [autofillValue, setAutofillValue] = useState('');

  const activeHighlightStep = tourVisible ? TOUR_STEPS[tourStepIndex]?.id : null;

  // Fake navigation object passed to child screens
  const navigation = {
    navigate: (screen: string) => {
      if (screen === 'Todos') setActiveTab('todos');
      else if (screen === 'Journal') setActiveTab('journal');
      else if (screen === 'Voice') setActiveTab('voice');
      else if (screen === 'Agents') setActiveTab('agents');
      else if (screen === 'Settings') setActiveTab('settings');
      else if (screen === 'Today') setActiveTab('today');
    },
  };

  const startTour = () => {
    setTourStepIndex(0);
    setActiveTab('today');
    setTourVisible(true);
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'today':
        return (
          <TodayScreen
            navigation={navigation}
            onOpenTour={startTour}
            autofillValue={autofillValue}
            activeHighlightStep={activeHighlightStep}
          />
        );
      case 'todos':
        return <TodosScreen activeHighlightStep={activeHighlightStep} />;
      case 'voice':
        return <VoiceScreen activeHighlightStep={activeHighlightStep} />;
      case 'journal':
        return <JournalScreen activeHighlightStep={activeHighlightStep} />;
      case 'agents':
        return <IntegrationsScreen activeHighlightStep={activeHighlightStep} />;
      case 'settings':
        return (
          <SettingsScreen
            onOpenWelcome={() => setWelcomeVisible(true)}
            onOpenTour={startTour}
          />
        );
      default:
        return (
          <TodayScreen
            navigation={navigation}
            onOpenTour={startTour}
            autofillValue={autofillValue}
            activeHighlightStep={activeHighlightStep}
          />
        );
    }
  };

  return (
    <View style={styles.appContainer}>
      <StatusBar style="light" />
      <AuroraBackground />

      {/* Screen View */}
      <View style={styles.screenContainer}>{renderScreen()}</View>

      {/* Toast Overlay Banner */}
      {toast && (
        <View style={[styles.toastBanner, { top: insets.top + 10 }]}>
          <TouchableOpacity
            style={[
              styles.toastContent,
              toast.tone === 'warn' && styles.toastWarn,
              toast.tone === 'error' && styles.toastError,
              toast.tone === 'info' && styles.toastInfo,
            ]}
            onPress={hideToast}
            activeOpacity={0.9}
          >
            <View style={styles.toastDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.toastTitle}>{toast.title}</Text>
              {toast.body ? <Text style={styles.toastBody}>{toast.body}</Text> : null}
            </View>
            <CustomIcon name="close" size={14} color="#8a94a6" />
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Floating Navigation Dock */}
      <View style={[styles.bottomBarContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.dockBar}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
              >
                {/* Active Indicator Glow Background */}
                {isActive && <View style={styles.activeGlowBlob} />}

                <View style={styles.tabIconWrapper}>
                  <CustomIcon
                    name={tab.icon}
                    size={20}
                    color={isActive ? '#34d399' : '#8a94a6'}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                  {tab.key === 'todos' && stats.plateCount > 0 && (
                    <View style={styles.badgeDot}>
                      <Text style={styles.badgeDotText}>{stats.plateCount}</Text>
                    </View>
                  )}
                  {tab.key === 'today' && runningActivity && (
                    <View style={styles.runningPulseDot} />
                  )}
                </View>

                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Welcome Landing Screen Modal (Asset 3 recreation) */}
      <Modal
        visible={welcomeVisible}
        animationType="slide"
        onRequestClose={() => setWelcomeVisible(false)}
      >
        <WelcomeScreen
          onEnterApp={() => setWelcomeVisible(false)}
          onOpenTour={() => {
            setWelcomeVisible(false);
            startTour();
          }}
        />
      </Modal>

      {/* Interactive Step-by-Step Guided Walkthrough Tour with Real Spotlight Highlighting */}
      <InteractiveTour
        visible={tourVisible}
        stepIndex={tourStepIndex}
        onClose={() => setTourVisible(false)}
        onStepChange={idx => setTourStepIndex(idx)}
        onSwitchTab={tab => setActiveTab(tab)}
        onTriggerAutofill={cmd => setAutofillValue(cmd)}
      />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  return (
    <SafeAreaProvider>
      <View style={styles.rootContainer}>
        <DataProvider>
          <MainAppContent />
        </DataProvider>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#040506',
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#070709',
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  screenContainer: {
    flex: 1,
  },
  toastBanner: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(16, 26, 20, 0.96)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.4)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#34d399',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  toastWarn: {
    borderColor: 'rgba(251, 191, 36, 0.5)',
  },
  toastError: {
    borderColor: 'rgba(244, 63, 94, 0.5)',
  },
  toastInfo: {
    borderColor: 'rgba(122, 162, 247, 0.5)',
  },
  toastDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34d399',
  },
  toastTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f3eee4',
  },
  toastBody: {
    fontSize: 11,
    color: '#8a94a6',
    marginTop: 2,
  },
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
    pointerEvents: 'box-none',
  },
  dockBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 460,
    backgroundColor: 'rgba(12, 18, 15, 0.92)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.18)',
    paddingVertical: 8,
    paddingHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 10,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabBtnActive: {},
  activeGlowBlob: {
    position: 'absolute',
    top: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
  },
  tabIconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
  },
  badgeDot: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#ff5c7a',
    borderRadius: 8,
    minWidth: 15,
    height: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeDotText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
  },
  runningPulseDot: {
    position: 'absolute',
    top: -2,
    right: -6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34d399',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#8a94a6',
    marginTop: 3,
  },
  tabLabelActive: {
    color: '#34d399',
    fontWeight: '700',
  },
});
