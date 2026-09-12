import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../constants/theme';
import { CustomIcon } from '../components/CustomIcon';
import { useData } from '../context/DataContext';

const { width } = Dimensions.get('window');

interface WelcomeScreenProps {
  onEnterApp: () => void;
  onOpenTour: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onEnterApp,
  onOpenTour,
}) => {
  const { updateSettings, showToast } = useData();
  const [email, setEmail] = useState('deadman@dayset.io');
  const [password, setPassword] = useState('••••••••');

  const handleSignIn = async () => {
    await updateSettings({
      email,
      userName: 'The Deadman',
      isDemoUser: false,
    });
    showToast('Welcome back, The Deadman', 'Signing into DayTracker...', 'success');
    onEnterApp();
  };

  const handleDemoSignIn = async () => {
    await updateSettings({
      email: 'demo@daytracker.app',
      userName: 'Demo Pilot',
      isDemoUser: true,
    });
    showToast('Welcome to Demo Mode', 'Interactive tour ready', 'info');
    onOpenTour();
    onEnterApp();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      {/* Radiant Amber Sun Aura Background */}
      <View style={styles.sunAuraContainer} pointerEvents="none">
        <View style={styles.sunAuraCore} />
        <View style={styles.sunAuraHaze} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Brand Badges Row */}
        <View style={styles.badgesRow}>
          <View style={styles.brandBadge}>
            <View style={styles.brandBadgeIcon}>
              <Text style={styles.brandBadgeIconText}>L</Text>
            </View>
            <Text style={styles.brandBadgeText}>DAYTRACKER</Text>
          </View>

          <TouchableOpacity style={styles.docsBadge} onPress={onOpenTour}>
            <CustomIcon name="book" size={13} color="#8a94a6" />
            <Text style={styles.docsBadgeText}>HARNESS DOCS</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Headlines */}
        <View style={styles.heroSection}>
          <Text style={styles.heroHeadline}>Your day,</Text>
          <Text style={styles.heroHeadlineItalic}>beautifully kept.</Text>

          <Text style={styles.heroSubhead}>
            A personal ledger for everything you do: todos, time, reminders — with
            a voice that talks back and an MCP door for your agents.
          </Text>

          {/* Feature Highlights */}
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={styles.featureIconCircle}>
                <CustomIcon name="clock" size={16} color="#fbbf24" />
              </View>
              <Text style={styles.featureText}>
                A living 24-hour arc of your day, drawn as you work.
              </Text>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconCircle}>
                <CustomIcon name="mic" size={16} color="#fbbf24" />
              </View>
              <Text style={styles.featureText}>
                Voice-to-voice todos and reminders — bring your own AI keys.
              </Text>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconCircle}>
                <CustomIcon name="plug" size={16} color="#fbbf24" />
              </View>
              <Text style={styles.featureText}>
                MCP server + SDK so your agents keep your ledger too.
              </Text>
            </View>
          </View>
        </View>

        {/* Login Card */}
        <View style={styles.loginCard}>
          <View style={styles.loginHeader}>
            <Text style={styles.loginTitle}>Welcome back</Text>
            <TouchableOpacity>
              <Text style={styles.signupLink}>New here? Sign up</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#6b7280"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#6b7280"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Golden Amber Sign In Button */}
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={handleSignIn}
            activeOpacity={0.8}
          >
            <Text style={styles.signInBtnText}>Sign in</Text>
            <CustomIcon name="arrow-right" size={16} color="#070709" strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Continue with Google */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleSignIn}
            activeOpacity={0.8}
          >
            <View style={styles.googleIconBox}>
              <Text style={styles.googleG}>G</Text>
            </View>
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Try Demo Account */}
          <TouchableOpacity
            style={styles.demoBox}
            onPress={handleDemoSignIn}
            activeOpacity={0.7}
          >
            <CustomIcon name="sparkles" size={14} color="#fbbf24" />
            <Text style={styles.demoText}>
              Try the demo account (demo@daytracker.app)
            </Text>
          </TouchableOpacity>

          <View style={styles.tourNoteRow}>
            <CustomIcon name="help" size={12} color="#8a94a6" />
            <Text style={styles.tourNoteText}>
              An interactive tour walks you through on first sign-in
            </Text>
          </View>
        </View>

        {/* Bottom Link */}
        <TouchableOpacity style={styles.bottomLink} onPress={handleSignIn}>
          <Text style={styles.bottomLinkText}>ENTER DAYTRACKER</Text>
          <CustomIcon name="chevron-down" size={14} color="#8a94a6" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#070709',
  },
  sunAuraContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  sunAuraCore: {
    position: 'absolute',
    top: 50,
    left: -60,
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: 9999,
    backgroundColor: '#f59e0b',
    opacity: 0.28,
  },
  sunAuraHaze: {
    position: 'absolute',
    top: -20,
    left: -120,
    width: width * 1.1,
    height: width * 1.1,
    borderRadius: 9999,
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 9999,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  brandBadgeIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fbbf24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadgeIconText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#070709',
  },
  brandBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#f3eee4',
  },
  docsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 9999,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  docsBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#8a94a6',
  },
  heroSection: {
    marginBottom: 24,
  },
  heroHeadline: {
    fontSize: 42,
    fontFamily: THEME.typography.serif,
    color: '#f3eee4',
    lineHeight: 46,
  },
  heroHeadlineItalic: {
    fontSize: 42,
    fontFamily: THEME.typography.serif,
    fontStyle: 'italic',
    color: '#fbbf24',
    lineHeight: 46,
    textShadowColor: 'rgba(251, 191, 36, 0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
    marginBottom: 14,
  },
  heroSubhead: {
    fontSize: 14,
    color: '#d1cdc4',
    lineHeight: 22,
    marginBottom: 20,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 13,
    color: '#d1cdc4',
    flex: 1,
    lineHeight: 18,
  },
  loginCard: {
    backgroundColor: 'rgba(18, 22, 20, 0.92)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 22,
    marginBottom: 20,
  },
  loginHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginTitle: {
    fontSize: 20,
    fontFamily: THEME.typography.serif,
    color: '#f3eee4',
  },
  signupLink: {
    fontSize: 11,
    color: '#fbbf24',
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f3eee4',
    fontSize: 14,
    marginBottom: 12,
  },
  signInBtn: {
    backgroundColor: '#fbbf24',
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  signInBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#070709',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#8a94a6',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingVertical: 12,
  },
  googleIconBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    fontSize: 12,
    fontWeight: '900',
    color: '#4285F4',
  },
  googleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f3eee4',
  },
  demoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 8,
  },
  demoText: {
    fontSize: 12,
    color: '#fbbf24',
    fontWeight: '500',
  },
  tourNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  tourNoteText: {
    fontSize: 11,
    color: '#8a94a6',
  },
  bottomLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  bottomLinkText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#8a94a6',
  },
});
