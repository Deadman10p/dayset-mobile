import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useData } from '../context/DataContext';
import { THEME, PRIORITIES, CATEGORIES } from '../constants/theme';
import { Priority, ActivityCategory } from '../types';
import { CustomIcon } from './CustomIcon';

interface NewTaskModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ visible, onClose }) => {
  const { addTodo, showToast } = useData();

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<ActivityCategory>('deep-work');
  const [tagsInput, setTagsInput] = useState('');
  const [notes, setNotes] = useState('');
  const [duePreset, setDuePreset] = useState<'today' | 'tomorrow' | 'someday'>('today');

  const handleSubmit = async () => {
    if (!title.trim()) return;

    let dueAt: string | null = null;
    const now = new Date();
    if (duePreset === 'today') {
      now.setHours(18, 0, 0, 0);
      dueAt = now.toISOString();
    } else if (duePreset === 'tomorrow') {
      now.setDate(now.getDate() + 1);
      now.setHours(9, 0, 0, 0);
      dueAt = now.toISOString();
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    await addTodo({
      title: title.trim(),
      priority,
      category,
      tags,
      notes: notes.trim() || undefined,
      due_at: dueAt,
    });

    showToast('Task Created', title.trim(), 'success');
    setTitle('');
    setTagsInput('');
    setNotes('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>New Task on Plate</Text>
            <TouchableOpacity onPress={onClose}>
              <CustomIcon name="close" size={20} color="#8a94a6" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Title */}
            <Text style={styles.fieldLabel}>TITLE</Text>
            <TextInput
              style={styles.textInput}
              placeholder="What needs doing?"
              placeholderTextColor="#6b7280"
              value={title}
              onChangeText={setTitle}
              autoFocus
            />

            {/* Priority Selector */}
            <Text style={styles.fieldLabel}>PRIORITY</Text>
            <View style={styles.priorityRow}>
              {(['low', 'medium', 'high', 'urgent'] as Priority[]).map(p => {
                const isSelected = priority === p;
                const pInfo = PRIORITIES[p];
                return (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.prioPill,
                      isSelected && {
                        backgroundColor: pInfo.badgeColor,
                        borderColor: pInfo.color,
                      },
                    ]}
                    onPress={() => setPriority(p)}
                  >
                    <Text
                      style={[
                        styles.prioText,
                        isSelected && { color: pInfo.color, fontWeight: '700' },
                      ]}
                    >
                      !{pInfo.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Due Date Presets */}
            <Text style={styles.fieldLabel}>DUE DATE</Text>
            <View style={styles.dueRow}>
              <TouchableOpacity
                style={[
                  styles.duePill,
                  duePreset === 'today' && styles.duePillActive,
                ]}
                onPress={() => setDuePreset('today')}
              >
                <Text
                  style={[
                    styles.dueText,
                    duePreset === 'today' && styles.dueTextActive,
                  ]}
                >
                  Today 6:00 PM
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.duePill,
                  duePreset === 'tomorrow' && styles.duePillActive,
                ]}
                onPress={() => setDuePreset('tomorrow')}
              >
                <Text
                  style={[
                    styles.dueText,
                    duePreset === 'tomorrow' && styles.dueTextActive,
                  ]}
                >
                  Tomorrow 9:00 AM
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.duePill,
                  duePreset === 'someday' && styles.duePillActive,
                ]}
                onPress={() => setDuePreset('someday')}
              >
                <Text
                  style={[
                    styles.dueText,
                    duePreset === 'someday' && styles.dueTextActive,
                  ]}
                >
                  Inbox / No date
                </Text>
              </TouchableOpacity>
            </View>

            {/* Category Selector */}
            <Text style={styles.fieldLabel}>CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={styles.catRow}>
                {CATEGORIES.map(cat => {
                  const isSelected = category === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.catPill,
                        isSelected && {
                          backgroundColor: `${cat.color}25`,
                          borderColor: cat.color,
                        },
                      ]}
                      onPress={() => setCategory(cat.id)}
                    >
                      <Text style={{ fontSize: 13 }}>{cat.emoji}</Text>
                      <Text
                        style={[
                          styles.catText,
                          isSelected && { color: '#f3eee4', fontWeight: '600' },
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Tags */}
            <Text style={styles.fieldLabel}>TAGS (COMMA SEPARATED)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="work, design, mcp..."
              placeholderTextColor="#6b7280"
              value={tagsInput}
              onChangeText={setTagsInput}
            />

            {/* Notes */}
            <Text style={styles.fieldLabel}>NOTES / ACCEPTANCE CRITERIA</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Context, links, agent instructions..."
              placeholderTextColor="#6b7280"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </ScrollView>

          {/* Footer Submit Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitBtn, !title.trim() && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!title.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.submitBtnText}>Add to Plate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0c1410',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.25)',
    maxHeight: '85%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: THEME.typography.serif,
    color: '#f3eee4',
  },
  body: {
    padding: 20,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#8a94a6',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#f3eee4',
    marginBottom: 16,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  prioPill: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  prioText: {
    fontSize: 12,
    color: '#8a94a6',
  },
  dueRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  duePill: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  duePillActive: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderColor: '#34d399',
  },
  dueText: {
    fontSize: 11,
    color: '#8a94a6',
    textAlign: 'center',
  },
  dueTextActive: {
    color: '#34d399',
    fontWeight: '600',
  },
  catRow: {
    flexDirection: 'row',
    gap: 8,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  catText: {
    fontSize: 12,
    color: '#8a94a6',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  submitBtn: {
    backgroundColor: '#34d399',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#070709',
  },
});
