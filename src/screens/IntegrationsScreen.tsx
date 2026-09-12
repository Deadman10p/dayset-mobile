import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '../context/DataContext';
import { THEME } from '../constants/theme';
import { CustomIcon } from '../components/CustomIcon';
import { TourSpotlightBadge } from '../components/TourSpotlightBadge';
import { formatTimeAgo } from '../utils/parser';

interface McpTool {
  name: string;
  description: string;
  category: 'plate' | 'arc' | 'reminders' | 'ledger';
  params: string;
}

const MCP_TOOLS: McpTool[] = [
  {
    name: 'list_todos',
    description: 'Fetch all open, snoozed, and completed todos with priorities and tags.',
    category: 'plate',
    params: '{ status?: "open"|"done"|"all", tag?: string }',
  },
  {
    name: 'add_todo',
    description: 'Create a new task on the user plate with priority, due date, and tags.',
    category: 'plate',
    params: '{ title: string, priority?: "urgent"|"high"|"medium"|"low", due_at?: string }',
  },
  {
    name: 'complete_todo',
    description: 'Mark a todo as completed with timestamp.',
    category: 'plate',
    params: '{ id: string }',
  },
  {
    name: 'get_day_arc',
    description: 'Retrieve the 24-hour arc schedule and logged category segments for today.',
    category: 'arc',
    params: '{ date?: string }',
  },
  {
    name: 'start_focus',
    description: 'Start a live focus session timer with selected category.',
    category: 'arc',
    params: '{ title: string, category: "deep-work"|"meetings"|"admin"|"learning"|"health" }',
  },
  {
    name: 'stop_focus',
    description: 'Stop the currently running focus session and log its duration on the arc.',
    category: 'arc',
    params: '{}',
  },
  {
    name: 'log_activity',
    description: 'Record a completed activity block with duration in minutes.',
    category: 'arc',
    params: '{ title: string, duration_min: number, category: string }',
  },
  {
    name: 'list_reminders',
    description: 'List upcoming scheduled reminders in orbit.',
    category: 'reminders',
    params: '{ status?: "pending"|"all" }',
  },
  {
    name: 'add_reminder',
    description: 'Schedule a time-based reminder.',
    category: 'reminders',
    params: '{ title: string, remind_at: string }',
  },
  {
    name: 'get_journal_summary',
    description: 'Get daily energy ratings, category percentage breakdown, and reflections.',
    category: 'ledger',
    params: '{ date?: string }',
  },
  {
    name: 'get_plate',
    description: 'Fast fetch of tasks due today or overdue.',
    category: 'plate',
    params: '{}',
  },
  {
    name: 'query_ledger',
    description: 'Natural language search across all user activities, tasks, and notes.',
    category: 'ledger',
    params: '{ query: string }',
  },
];

interface IntegrationsScreenProps {
  activeHighlightStep?: string | null;
}

export const IntegrationsScreen: React.FC<IntegrationsScreenProps> = ({ activeHighlightStep }) => {
  const { settings, updateSettings, todos, activities, reminders, events, logEvent, showToast } = useData();

  const [activeHarness, setActiveHarness] = useState<'claude' | 'cursor' | 'hermes'>('claude');
  const [selectedTool, setSelectedTool] = useState<McpTool | null>(null);
  const [testOutput, setTestOutput] = useState<string | null>(null);

  const token = settings.mcpToken || 'dt_live_9f83a2c410e7b45';

  const copyToClipboard = (text: string, label: string) => {
    showToast('Copied to Clipboard', label, 'info');
  };

  const regenerateToken = async () => {
    const newToken = 'dt_live_' + Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 6);
    await updateSettings({ mcpToken: newToken });
    showToast('Token Regenerated', newToken, 'success');
  };

  // Run a simulation of an MCP tool call
  const executeMcpTool = async (tool: McpTool) => {
    setSelectedTool(tool);
    await logEvent('mcp_tool_call', `Agent executed ${tool.name}()`, 'agent');

    let result: any = {};
    if (tool.name === 'list_todos' || tool.name === 'get_plate') {
      result = {
        count: todos.length,
        items: todos.slice(0, 4).map(t => ({
          id: t.id,
          title: t.title,
          priority: t.priority,
          status: t.status,
          tags: t.tags,
        })),
      };
    } else if (tool.name === 'get_day_arc') {
      result = {
        date: new Date().toISOString().split('T')[0],
        total_logged_min: activities.reduce((sum, a) => sum + (a.duration_min || 0), 0),
        segments: activities.map(a => ({
          title: a.title,
          category: a.category,
          duration_min: a.duration_min,
        })),
      };
    } else if (tool.name === 'list_reminders') {
      result = {
        reminders: reminders.filter(r => r.status === 'pending'),
      };
    } else {
      result = {
        success: true,
        tool: tool.name,
        timestamp: new Date().toISOString(),
        message: `Tool ${tool.name} executed successfully by agent harness.`,
      };
    }

    setTestOutput(JSON.stringify(result, null, 2));
    showToast('MCP Tool Executed', tool.name, 'success');
  };

  const getSnippet = () => {
    if (activeHarness === 'claude') {
      return `claude mcp add dayset -- https://api.dayset.app/mcp \\
  -H "Authorization: Bearer ${token}"`;
    }
    if (activeHarness === 'cursor') {
      return `// ~/.cursor/mcp.json
{
  "mcpServers": {
    "dayset": {
      "url": "https://api.dayset.app/mcp",
      "headers": {
        "Authorization": "Bearer ${token}"
      }
    }
  }
}`;
    }
    return `# Python Hermes / Pi Agent
from mcp.client import ClientSession

async with ClientSession("https://api.dayset.app/mcp") as session:
    session.headers["Authorization"] = "Bearer ${token}"
    todos = await session.call_tool("get_plate", {})
    print(todos)`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>MODEL CONTEXT PROTOCOL</Text>
          <Text style={styles.headerTitle}>Agent Harness</Text>
        </View>

        <View style={styles.mcpBadge}>
          <CustomIcon name="plug" size={13} color="#7aa2f7" />
          <Text style={styles.mcpBadgeText}>v1.0 MCP</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {activeHighlightStep === 'mcp' && (
          <TourSpotlightBadge
            stepNumber={9}
            label="MCP Agent Gateway"
            color="#7aa2f7"
            direction="down"
          />
        )}

        {/* Token Management Card */}
        <View style={[styles.card, activeHighlightStep === 'mcp' && styles.spotlightCard]}>
          <Text style={styles.cardHeaderLabel}>PERSONAL ACCESS TOKEN</Text>
          <Text style={styles.cardSubtext}>
            Connect Claude Code, Cursor, Pi, and custom agents directly to your day.
          </Text>

          <View style={styles.tokenRow}>
            <TextInput
              style={styles.tokenInput}
              value={token}
              editable={false}
              secureTextEntry
            />
            <TouchableOpacity
              style={styles.copyBtn}
              onPress={() => copyToClipboard(token, 'MCP Token')}
            >
              <CustomIcon name="copy" size={16} color="#070709" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <View style={styles.tokenFooterRow}>
            <TouchableOpacity onPress={regenerateToken}>
              <Text style={styles.regenerateText}>Regenerate Token</Text>
            </TouchableOpacity>
            <Text style={styles.endpointLabel}>Endpoint: https://api.dayset.app/mcp</Text>
          </View>
        </View>

        {/* Harness Selection & Snippet Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderLabel}>PICK A HARNESS, PASTE A SNIPPET</Text>

          {/* Harness Selector Tabs */}
          <View style={styles.harnessTabs}>
            <TouchableOpacity
              style={[styles.harnessTab, activeHarness === 'claude' && styles.harnessTabActive]}
              onPress={() => setActiveHarness('claude')}
            >
              <Text
                style={[
                  styles.harnessTabText,
                  activeHarness === 'claude' && styles.harnessTabTextActive,
                ]}
              >
                Claude Code
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.harnessTab, activeHarness === 'cursor' && styles.harnessTabActive]}
              onPress={() => setActiveHarness('cursor')}
            >
              <Text
                style={[
                  styles.harnessTabText,
                  activeHarness === 'cursor' && styles.harnessTabTextActive,
                ]}
              >
                Cursor
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.harnessTab, activeHarness === 'hermes' && styles.harnessTabActive]}
              onPress={() => setActiveHarness('hermes')}
            >
              <Text
                style={[
                  styles.harnessTabText,
                  activeHarness === 'hermes' && styles.harnessTabTextActive,
                ]}
              >
                Hermes / Python
              </Text>
            </TouchableOpacity>
          </View>

          {/* Code Snippet Box */}
          <View style={styles.codeSnippetBox}>
            <View style={styles.codeHeader}>
              <Text style={styles.codeLangText}>
                {activeHarness === 'claude'
                  ? 'Terminal'
                  : activeHarness === 'cursor'
                  ? 'JSON'
                  : 'Python'}
              </Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(getSnippet(), `${activeHarness} configuration`)}
              >
                <CustomIcon name="copy" size={14} color="#8a94a6" />
              </TouchableOpacity>
            </View>
            <Text style={styles.codeText}>{getSnippet()}</Text>
          </View>
        </View>

        {/* 12 MCP Tools & Interactive Tester */}
        <View style={styles.card}>
          <View style={styles.toolsHeaderRow}>
            <Text style={styles.cardHeaderLabel}>AVAILABLE MCP TOOLS (12)</Text>
            <Text style={styles.tapToRunHint}>Tap tool to simulate agent execution</Text>
          </View>

          <View style={styles.toolsGrid}>
            {MCP_TOOLS.map(tool => (
              <TouchableOpacity
                key={tool.name}
                style={[
                  styles.toolCard,
                  selectedTool?.name === tool.name && styles.toolCardActive,
                ]}
                onPress={() => executeMcpTool(tool)}
                activeOpacity={0.7}
              >
                <View style={styles.toolTopRow}>
                  <Text style={styles.toolName}>{tool.name}()</Text>
                  <View style={styles.playChip}>
                    <CustomIcon name="play" size={10} color="#34d399" />
                    <Text style={styles.playChipText}>Run</Text>
                  </View>
                </View>
                <Text style={styles.toolDesc} numberOfLines={2}>
                  {tool.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Test Output Console */}
          {testOutput && (
            <View style={styles.testConsoleBox}>
              <View style={styles.consoleHeader}>
                <CustomIcon name="terminal" size={14} color="#34d399" />
                <Text style={styles.consoleTitle}>
                  Agent Response: {selectedTool?.name}
                </Text>
              </View>
              <Text style={styles.consoleCode}>{testOutput}</Text>
            </View>
          )}
        </View>

        {/* Agent Audit Event Stream */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderLabel}>AGENT & USER AUDIT LOG</Text>

          {events.length === 0 ? (
            <Text style={styles.noEventsText}>
              No events recorded yet. Run an MCP tool or complete a task to see live ledger activity.
            </Text>
          ) : (
            <View style={styles.eventsList}>
              {events.slice(0, 8).map(evt => (
                <View key={evt.id} style={styles.eventItem}>
                  <View
                    style={[
                      styles.actorBadge,
                      evt.actor === 'agent' ? styles.actorAgent : styles.actorUser,
                    ]}
                  >
                    <Text
                      style={[
                        styles.actorBadgeText,
                        evt.actor === 'agent'
                          ? { color: '#7aa2f7' }
                          : { color: '#34d399' },
                      ]}
                    >
                      {evt.actor.toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.eventContent}>
                    <Text style={styles.eventSummary}>{evt.summary}</Text>
                    <Text style={styles.eventTime}>{formatTimeAgo(evt.created_at)}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
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
  mcpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(122, 162, 247, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(122, 162, 247, 0.3)',
    borderRadius: 9999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  mcpBadgeText: {
    fontSize: 11,
    color: '#7aa2f7',
    fontWeight: '600',
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
  spotlightCard: {
    borderWidth: 2,
    borderColor: '#7aa2f7',
    backgroundColor: 'rgba(122, 162, 247, 0.08)',
    shadowColor: '#7aa2f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 12,
  },
  cardHeaderLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#8a94a6',
    marginBottom: 6,
  },
  cardSubtext: {
    fontSize: 12,
    color: '#d1cdc4',
    lineHeight: 18,
    marginBottom: 12,
  },
  tokenRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  tokenInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#34d399',
    fontFamily: THEME.typography.mono,
  },
  copyBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#34d399',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  regenerateText: {
    fontSize: 11,
    color: '#34d399',
    fontWeight: '600',
  },
  endpointLabel: {
    fontSize: 10,
    color: '#8a94a6',
    fontFamily: THEME.typography.mono,
  },
  harnessTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 8,
    padding: 3,
    marginBottom: 12,
    marginTop: 6,
  },
  harnessTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 6,
  },
  harnessTabActive: {
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
  },
  harnessTabText: {
    fontSize: 11,
    color: '#8a94a6',
    fontWeight: '500',
  },
  harnessTabTextActive: {
    color: '#34d399',
    fontWeight: '700',
  },
  codeSnippetBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 12,
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    paddingBottom: 6,
  },
  codeLangText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#8a94a6',
  },
  codeText: {
    fontSize: 11,
    color: '#f3eee4',
    fontFamily: THEME.typography.mono,
    lineHeight: 18,
  },
  toolsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tapToRunHint: {
    fontSize: 10,
    color: '#8a94a6',
    fontStyle: 'italic',
  },
  toolsGrid: {
    gap: 8,
  },
  toolCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 10,
  },
  toolCardActive: {
    borderColor: '#34d399',
    backgroundColor: 'rgba(52, 211, 153, 0.06)',
  },
  toolTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  toolName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34d399',
    fontFamily: THEME.typography.mono,
  },
  playChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  playChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#34d399',
  },
  toolDesc: {
    fontSize: 11,
    color: '#8a94a6',
    lineHeight: 16,
  },
  testConsoleBox: {
    marginTop: 14,
    backgroundColor: '#0a100d',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
    padding: 12,
  },
  consoleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  consoleTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34d399',
    fontFamily: THEME.typography.mono,
  },
  consoleCode: {
    fontSize: 10,
    color: '#f3eee4',
    fontFamily: THEME.typography.mono,
    lineHeight: 16,
  },
  noEventsText: {
    fontSize: 12,
    color: '#8a94a6',
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  eventsList: {
    gap: 8,
    marginTop: 6,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 8,
    padding: 8,
  },
  actorBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  actorAgent: {
    backgroundColor: 'rgba(122, 162, 247, 0.15)',
  },
  actorUser: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
  },
  actorBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  eventContent: {
    flex: 1,
  },
  eventSummary: {
    fontSize: 12,
    color: '#f3eee4',
  },
  eventTime: {
    fontSize: 10,
    color: '#525a68',
    marginTop: 2,
  },
});
