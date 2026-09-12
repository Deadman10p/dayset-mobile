import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '../context/DataContext';
import { THEME } from '../constants/theme';
import { CustomIcon } from '../components/CustomIcon';
import { parseNaturalLanguage, formatMinutes } from '../utils/parser';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ledger';
  text: string;
  actionTaken?: string;
  timestamp: string;
}

export const VoiceScreen: React.FC = () => {
  const {
    todos,
    activities,
    stats,
    addTodo,
    addReminder,
    addActivity,
    startActivity,
    stopActivity,
    runningActivity,
    settings,
    showToast,
  } = useData();

  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ledger',
      text: `Hello ${settings.userName}. I'm Ledger, your personal daykeeper. Tap the orb or say what you'd like to log, schedule, or review.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Pulse animation for the glowing orb
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, pulseAnim]);

  const processLedgerCommand = async (userInput: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: userInput,
      timestamp: timeStr,
    };

    setMessages(prev => [...prev, userMsg]);
    setIsListening(false);

    // AI Ledger Processing logic
    const inputLower = userInput.toLowerCase();
    let replyText = '';
    let actionTaken = '';

    if (inputLower.includes('what is on my plate') || inputLower.includes('on my plate') || inputLower.includes('tasks')) {
      const openTasks = todos.filter(t => t.status === 'open');
      if (openTasks.length === 0) {
        replyText = "Your plate is completely clear today! Nothing due right now.";
      } else {
        const top3 = openTasks.slice(0, 3).map(t => `• ${t.title} (!${t.priority})`).join('\n');
        replyText = `You have ${openTasks.length} tasks on your plate:\n${top3}${openTasks.length > 3 ? `\n...and ${openTasks.length - 3} more.` : ''}`;
      }
    } else if (inputLower.includes('how much time') || inputLower.includes('summary')) {
      replyText = `Today you've logged ${formatMinutes(stats.loggedMinutesToday)} across ${activities.length} sessions, with ${stats.doneTodayCount} tasks completed.`;
    } else if (inputLower.includes('stop') && (inputLower.includes('timer') || inputLower.includes('focus'))) {
      if (runningActivity) {
        const stopped = await stopActivity();
        replyText = `Stopped focus session. Logged ${stopped?.duration_min || 1} minutes of ${stopped?.category}.`;
        actionTaken = 'Focus session stopped';
      } else {
        replyText = "There isn't any active focus session running right now.";
      }
    } else {
      // Natural language command
      const parsed = parseNaturalLanguage(userInput);

      if (parsed.kind === 'reminder') {
        const target = parsed.dueAt || new Date(Date.now() + 3600000);
        await addReminder({
          title: parsed.title,
          remind_at: target.toISOString(),
        });
        const dueTime = target.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        replyText = `I've set a reminder for "${parsed.title}" at ${dueTime}.`;
        actionTaken = 'Reminder scheduled';
      } else if (parsed.kind === 'log') {
        const dur = parsed.durationMin || 30;
        await addActivity({
          title: parsed.title,
          category: parsed.category || 'deep-work',
          duration_min: dur,
        });
        replyText = `Logged ${dur}m of ${parsed.category || 'deep-work'} for "${parsed.title}". Added to your 24-hour arc.`;
        actionTaken = 'Activity logged';
      } else if (parsed.kind === 'start') {
        await startActivity(parsed.title, parsed.category || 'deep-work');
        replyText = `Starting a ${parsed.category || 'deep-work'} focus session for "${parsed.title}". Dial is pulsing!`;
        actionTaken = 'Timer started';
      } else {
        await addTodo({
          title: parsed.title,
          priority: parsed.priority || 'medium',
          tags: parsed.tags,
          category: parsed.category,
        });
        replyText = `Added "${parsed.title}" to your plate with !${parsed.priority || 'medium'} priority.`;
        actionTaken = 'Task added';
      }
    }

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: 'ledger-' + Date.now(),
          sender: 'ledger',
          text: replyText,
          actionTaken,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      if (actionTaken) {
        showToast('Ledger Action', actionTaken, 'success');
      }
    }, 450);
  };

  const handleOrbPress = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      // Simulate speech recognition after 2.5s if no manual text
      setTimeout(() => {
        if (!inputText.trim()) {
          const samplePrompts = [
            'What is on my plate today?',
            'Log 45m deep-work on API refactor',
            'Remind me at 4pm to check pull requests',
            'Start focus on user interface',
          ];
          const chosen = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
          processLedgerCommand(chosen);
        }
      }, 2600);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>VOICE-TO-VOICE</Text>
          <Text style={styles.headerTitle}>Talk to Ledger</Text>
        </View>

        <View style={styles.onlineBadge}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>Ready</Text>
        </View>
      </View>

      <ScrollView style={styles.chatArea} contentContainerStyle={styles.chatContent}>
        {/* Holographic Voice Orb Centerpiece */}
        <View style={styles.orbContainer}>
          <TouchableOpacity onPress={handleOrbPress} activeOpacity={0.85}>
            {/* Outer Aura Ring */}
            <Animated.View
              style={[
                styles.orbAura,
                {
                  transform: [{ scale: pulseAnim }],
                  borderColor: isListening ? '#34d399' : 'rgba(52, 211, 153, 0.35)',
                  backgroundColor: isListening
                    ? 'rgba(52, 211, 153, 0.25)'
                    : 'rgba(52, 211, 153, 0.08)',
                },
              ]}
            >
              {/* Inner Glowing Core */}
              <View
                style={[
                  styles.orbCore,
                  { backgroundColor: isListening ? '#10b981' : '#0e2419' },
                ]}
              >
                <CustomIcon
                  name="mic"
                  size={36}
                  color={isListening ? '#ffffff' : '#34d399'}
                  strokeWidth={2.5}
                />
              </View>
            </Animated.View>
          </TouchableOpacity>

          <Text style={styles.orbStatusText}>
            {isListening ? 'Ledger is listening... (tap to speak)' : 'Tap orb to talk with Ledger'}
          </Text>

          {/* Audio Wave Bars */}
          {isListening && (
            <View style={styles.waveformRow}>
              {[18, 32, 48, 26, 42, 60, 35, 20, 50, 24].map((h, i) => (
                <View
                  key={i}
                  style={[styles.waveBar, { height: h, backgroundColor: '#34d399' }]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Quick Voice Suggestions */}
        <View style={styles.promptPillsRow}>
          <TouchableOpacity
            style={styles.promptPill}
            onPress={() => processLedgerCommand("What's on my plate today?")}
          >
            <Text style={styles.promptPillText}>"What's on my plate?"</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.promptPill}
            onPress={() => processLedgerCommand('Log 45m deep-work writing documentation')}
          >
            <Text style={styles.promptPillText}>"Log 45m deep work"</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.promptPill}
            onPress={() => processLedgerCommand('Remind me in 30 minutes to stretch')}
          >
            <Text style={styles.promptPillText}>"Remind me in 30m"</Text>
          </TouchableOpacity>
        </View>

        {/* Dialogue Stream */}
        <View style={styles.messagesList}>
          {messages.map(msg => (
            <View
              key={msg.id}
              style={[
                styles.msgBubble,
                msg.sender === 'user' ? styles.userBubble : styles.ledgerBubble,
              ]}
            >
              <View style={styles.msgHeader}>
                <Text style={styles.msgSenderLabel}>
                  {msg.sender === 'ledger' ? 'LEDGER' : settings.userName.toUpperCase()}
                </Text>
                <Text style={styles.msgTime}>{msg.timestamp}</Text>
              </View>

              <Text style={styles.msgText}>{msg.text}</Text>

              {msg.actionTaken && (
                <View style={styles.actionBadge}>
                  <CustomIcon name="check" size={11} color="#34d399" strokeWidth={3} />
                  <Text style={styles.actionBadgeText}>{msg.actionTaken}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Text/Voice Input */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask Ledger or type a command..."
          placeholderTextColor="#6b7280"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => {
            if (inputText.trim()) {
              processLedgerCommand(inputText.trim());
              setInputText('');
            }
          }}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
          onPress={() => {
            if (inputText.trim()) {
              processLedgerCommand(inputText.trim());
              setInputText('');
            }
          }}
          disabled={!inputText.trim()}
        >
          <CustomIcon name="arrow-right" size={16} color="#070709" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
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
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
    borderRadius: 9999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34d399',
  },
  onlineText: {
    fontSize: 11,
    color: '#34d399',
    fontWeight: '600',
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  orbContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  orbAura: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbCore: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbStatusText: {
    fontSize: 13,
    color: '#8a94a6',
    marginTop: 12,
    fontStyle: 'italic',
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 40,
    marginTop: 10,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
  },
  promptPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    marginBottom: 16,
  },
  promptPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  promptPillText: {
    fontSize: 12,
    color: '#34d399',
  },
  messagesList: {
    gap: 12,
  },
  msgBubble: {
    borderRadius: 16,
    padding: 14,
    maxWidth: '90%',
  },
  ledgerBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(18, 26, 22, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  msgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    gap: 12,
  },
  msgSenderLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#8a94a6',
  },
  msgTime: {
    fontSize: 10,
    color: '#525a68',
  },
  msgText: {
    fontSize: 13,
    color: '#f3eee4',
    lineHeight: 20,
  },
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  actionBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#34d399',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 85,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: '#070709',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#f3eee4',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#34d399',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.35,
  },
});
