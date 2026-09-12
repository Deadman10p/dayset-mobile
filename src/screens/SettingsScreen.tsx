import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '../context/DataContext';
import { THEME } from '../constants/theme';
import { CustomIcon } from '../components/CustomIcon';

interface SettingsScreenProps {
  onOpenWelcome: () => void;
  onOpenTour: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onOpenWelcome,
  onOpenTour,
}) => {
  const { settings, updateSettings, resetToDefaultData, showToast } = useData();

  const [userName, setUserName] = useState(settings.userName);
  const [email, setEmail] = useState(settings.email);
  const [openaiKey, setOpenaiKey] = useState(settings.openaiKey || '');
  const [anthropicKey, setAnthropicKey] = useState(settings.anthropicKey || '');
  const [elevenlabsKey, setElevenlabsKey] = useState(settings.elevenlabsKey || '');

  const handleSaveProfile = async () => {
    await updateSettings({
      userName: userName.trim() || 'The Deadman',
      email: email.trim() || 'user@daytracker.app',
      openaiKey: openaiKey.trim(),
      anthropicKey: anthropicKey.trim(),
      elevenlabsKey: elevenlabsKey.trim(),
    });
    showToast('Settings Saved', 'Profile & API keys updated', 'success');
  };

  const handleReset = () => {
    resetToDefaultData();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>PREFERENCES</Text>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSaveProfile}
          activeOpacity={0.8}
        >
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderLabel}>PROFILE</Text>

          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>
                {userName.charAt(0).toUpperCase() || 'D'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.avatarTitle}>{userName}</Text>
              <Text style={styles.avatarSub}>{email}</Text>
            </View>
          </View>

          <Text style={styles.fieldLabel}>DISPLAY NAME</Text>
          <TextInput
            style={styles.textInput}
            value={userName}
            onChangeText={setUserName}
            placeholder="e.g. The Deadman"
            placeholderTextColor="#6b7280"
          />

          <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
          <TextInput
            style={styles.textInput}
            value={email}
            onChangeText={setEmail}
            placeholder="e.g. deadman@dayset.io"
            placeholderTextColor="#6b7280"
            keyboardType="email-address"
          />
        </View>

        {/* AI & Voice Keys Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderLabel}>AI KEYS (OPTIONAL)</Text>
          <Text style={styles.cardSubtext}>
            Bring your own API keys for unmetered Claude voice reasoning & ElevenLabs audio playback.
          </Text>

          <Text style={styles.fieldLabel}>ANTHROPIC API KEY</Text>
          <TextInput
            style={styles.textInput}
            value={anthropicKey}
            onChangeText={setAnthropicKey}
            placeholder="sk-ant-api..."
            placeholderTextColor="#6b7280"
            secureTextEntry
          />

          <Text style={styles.fieldLabel}>OPENAI API KEY</Text>
          <TextInput
            style={styles.textInput}
            value={openaiKey}
            onChangeText={setOpenaiKey}
            placeholder="sk-proj-..."
            placeholderTextColor="#6b7280"
            secureTextEntry
          />

          <Text style={styles.fieldLabel}>ELEVENLABS KEY</Text>
          <TextInput
            style={styles.textInput}
            value={elevenlabsKey}
            onChangeText={setElevenlabsKey}
            placeholder="xi-..."
            placeholderTextColor="#6b7280"
            secureTextEntry
          />
        </View>

        {/* Actions & Landing Screen Preview */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderLabel}>EXPERIENCE & DATA</Text>

          {/* View Welcome Landing Page */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={onOpenWelcome}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <CustomIcon name="sun" size={18} color="#f59e0b" />
              <View>
                <Text style={styles.actionTitle}>Preview Welcome Hero (Asset 3)</Text>
                <Text style={styles.actionSub}>View the radiant golden sun landing page</Text>
              </View>
            </View>
            <CustomIcon name="chevron-right" size={16} color="#8a94a6" />
          </TouchableOpacity>

          {/* Interactive Tour */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={onOpenTour}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <CustomIcon name="help" size={18} color="#34d399" />
              <View>
                <Text style={styles.actionTitle}>Launch Interactive Tour</Text>
                <Text style={styles.actionSub}>Walk through the 24h arc, Ledger, and MCP</Text>
              </View>
            </View>
            <CustomIcon name="chevron-right" size={16} color="#8a94a6" />
          </TouchableOpacity>

          {/* Reset sample data */}
          <TouchableOpacity
            style={[styles.actionRow, { borderBottomWidth: 0 }]}
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <CustomIcon name="refresh" size={18} color="#f43f5e" />
              <View>
                <Text style={[styles.actionTitle, { color: '#f43f5e' }]}>
                  Reset to Sample Data
                </Text>
                <Text style={styles.actionSub}>Restore initial demo tasks and arc activities</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            DaySet · DayTracker mobile edition
          </Text>
          <Text style={styles.footerSubText}>
            Autonomous AI Ledger with MCP Agent Gateway
          </Text>
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
  saveBtn: {
    backgroundColor: '#34d399',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  saveBtnText: {
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
  cardSubtext: {
    fontSize: 12,
    color: '#d1cdc4',
    lineHeight: 18,
    marginBottom: 14,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#34d399',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: '800',
    color: '#070709',
  },
  avatarTitle: {
    fontSize: 16,
    fontFamily: THEME.typography.serif,
    color: '#f3eee4',
  },
  avatarSub: {
    fontSize: 12,
    color: '#8a94a6',
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#8a94a6',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#f3eee4',
    marginBottom: 14,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f3eee4',
  },
  actionSub: {
    fontSize: 11,
    color: '#8a94a6',
    marginTop: 2,
  },
  footerNote: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#8a94a6',
    fontWeight: '600',
  },
  footerSubText: {
    fontSize: 11,
    color: '#525a68',
    marginTop: 2,
  },
});
