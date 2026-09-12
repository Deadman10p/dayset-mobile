import React, { useState, useMemo } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useData } from '../context/DataContext';
import { parseNaturalLanguage } from '../utils/parser';
import { THEME, PRIORITIES } from '../constants/theme';
import { CustomIcon } from './CustomIcon';

interface OmnibarProps {
  onSuccess?: () => void;
  externalValue?: string;
}

export const Omnibar: React.FC<OmnibarProps> = ({ onSuccess, externalValue }) => {
  const { addTodo, addReminder, addActivity, startActivity, showToast } = useData();
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  React.useEffect(() => {
    if (externalValue !== undefined && externalValue !== '') {
      setInput(externalValue);
    }
  }, [externalValue]);

  // Live parsed preview of input
  const parsed = useMemo(() => {
    if (!input.trim()) return null;
    return parseNaturalLanguage(input);
  }, [input]);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    const parsedData = parseNaturalLanguage(input);

    try {
      if (parsedData.kind === 'reminder') {
        const remindAt = parsedData.dueAt || new Date(Date.now() + 3600 * 1000);
        await addReminder({
          title: parsedData.title,
          remind_at: remindAt.toISOString(),
        });
        showToast('Reminder Set', `${parsedData.title}`, 'success');
      } else if (parsedData.kind === 'log') {
        const duration = parsedData.durationMin || 30;
        await addActivity({
          title: parsedData.title,
          category: parsedData.category || 'deep-work',
          duration_min: duration,
        });
        showToast('Activity Logged', `${duration}m of ${parsedData.title}`, 'success');
      } else if (parsedData.kind === 'start') {
        await startActivity(parsedData.title, parsedData.category || 'deep-work');
        showToast('Focus Started', parsedData.title, 'success');
      } else {
        // default todo
        await addTodo({
          title: parsedData.title,
          priority: parsedData.priority || 'medium',
          due_at: parsedData.dueAt ? parsedData.dueAt.toISOString() : null,
          tags: parsedData.tags,
          category: parsedData.category,
        });
        showToast('Added to Plate', parsedData.title, 'success');
      }

      setInput('');
      onSuccess?.();
    } catch {
      showToast('Error', 'Could not process command', 'error');
    }
  };

  const insertToken = (token: string) => {
    setInput(prev => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} ${token}` : token;
    });
  };

  return (
    <View style={styles.container}>
      {/* Main Omnibar Input Box */}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
        ]}
      >
        <View style={styles.sparkleIconBox}>
          <CustomIcon name="sparkles" size={16} color="#34d399" />
        </View>

        <TextInput
          style={styles.textInput}
          placeholder="Finish quarterly report tomorrow !high #"
          placeholderTextColor="#6b7280"
          value={input}
          onChangeText={setInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSubmitEditing={handleSubmit}
          returnKeyType="done"
        />

        <TouchableOpacity
          style={[styles.addBtn, !input.trim() && styles.addBtnDisabled]}
          onPress={handleSubmit}
          disabled={!input.trim()}
          activeOpacity={0.8}
        >
          <Text style={styles.addBtnIcon}>⏎</Text>
          <Text style={styles.addBtnText}>add</Text>
        </TouchableOpacity>
      </View>

      {/* Live Token Recognizer Chips (when user is typing) */}
      {parsed && (
        <View style={styles.previewChipsRow}>
          <View style={[styles.badge, styles.badgeKind]}>
            <Text style={styles.badgeText}>{parsed.kind.toUpperCase()}</Text>
          </View>

          {parsed.priority && (
            <View
              style={[
                styles.badge,
                { backgroundColor: PRIORITIES[parsed.priority].badgeColor },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: PRIORITIES[parsed.priority].color },
                ]}
              >
                !{parsed.priority}
              </Text>
            </View>
          )}

          {parsed.durationMin && (
            <View style={[styles.badge, styles.badgeDuration]}>
              <Text style={[styles.badgeText, { color: '#7aa2f7' }]}>
                ⏱ {parsed.durationMin}m
              </Text>
            </View>
          )}

          {parsed.category && (
            <View style={[styles.badge, styles.badgeCategory]}>
              <Text style={[styles.badgeText, { color: '#34d399' }]}>
                {parsed.category}
              </Text>
            </View>
          )}

          {parsed.tags.map(tag => (
            <View key={tag} style={[styles.badge, styles.badgeTag]}>
              <Text style={styles.badgeText}>#{tag}</Text>
            </View>
          ))}

          {parsed.dueAt && (
            <View style={[styles.badge, styles.badgeTime]}>
              <Text style={[styles.badgeText, { color: '#fbbf24' }]}>
                📅{' '}
                {parsed.dueAt.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Quick Suggestion Chips (when idle or focused) */}
      {!input && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsContainer}
        >
          <TouchableOpacity
            style={styles.suggestPill}
            onPress={() => insertToken('!urgent')}
          >
            <Text style={[styles.suggestText, { color: '#ff5c7a' }]}>!urgent</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.suggestPill}
            onPress={() => insertToken('!high')}
          >
            <Text style={[styles.suggestText, { color: '#ff9f5a' }]}>!high</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.suggestPill}
            onPress={() => insertToken('#deep-work')}
          >
            <Text style={[styles.suggestText, { color: '#f2c85b' }]}>#deep-work</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.suggestPill}
            onPress={() => insertToken('tomorrow 9am')}
          >
            <Text style={styles.suggestText}>tomorrow 9am</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.suggestPill}
            onPress={() => insertToken('log 45m deep-work')}
          >
            <Text style={styles.suggestText}>log 45m</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.suggestPill}
            onPress={() => insertToken('remind me in 30m')}
          >
            <Text style={styles.suggestText}>remind me</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 19, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.22)',
    borderRadius: THEME.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minHeight: 48,
  },
  inputContainerFocused: {
    borderColor: '#34d399',
    backgroundColor: 'rgba(18, 28, 23, 0.98)',
  },
  sparkleIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#f3eee4',
    paddingVertical: 10,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.35)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addBtnDisabled: {
    opacity: 0.35,
  },
  addBtnIcon: {
    fontSize: 11,
    color: '#34d399',
    fontWeight: '700',
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34d399',
  },
  previewChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#f3eee4',
  },
  badgeKind: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderColor: 'rgba(52, 211, 153, 0.4)',
  },
  badgeDuration: {
    backgroundColor: 'rgba(122, 162, 247, 0.15)',
    borderColor: 'rgba(122, 162, 247, 0.4)',
  },
  badgeCategory: {
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  badgeTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  badgeTime: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderColor: 'rgba(251, 191, 36, 0.4)',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  suggestPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  suggestText: {
    fontSize: 11,
    color: '#8a94a6',
    fontWeight: '500',
  },
});
