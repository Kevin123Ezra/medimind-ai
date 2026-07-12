import React, {useMemo, useState} from 'react';
import {ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View} from 'react-native';

type TabKey = 'home' | 'reports' | 'assistant' | 'meds' | 'profile';

type Medication = {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
};

type Report = {
  id: string;
  title: string;
  date: string;
  summary: string;
};

const initialMessages = [
  {
    id: '1',
    sender: 'assistant' as const,
    message:
      "Hello Alexander. I am your MediMind Clinical AI Companion. Ask about medications, vitals, report summaries, or next steps.",
  },
  {
    id: '2',
    sender: 'user' as const,
    message: "What is Lisinopril usually prescribed for?",
  },
  {
    id: '3',
    sender: 'assistant' as const,
    message:
      'Lisinopril is commonly prescribed for high blood pressure and heart failure. It can also help protect kidney function in some patients.',
  },
];

const tabOrder: {key: TabKey; label: string}[] = [
  {key: 'home', label: 'Home'},
  {key: 'reports', label: 'Reports'},
  {key: 'assistant', label: 'AI'},
  {key: 'meds', label: 'Meds'},
  {key: 'profile', label: 'Profile'},
];

const quickActions = ['Open reports', 'Log medication', 'Talk to AI', 'Emergency SOS'];

export default function App() {
  const [signedIn, setSignedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [email, setEmail] = useState('alexander.miller@medimind.ai');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [messages, setMessages] = useState(initialMessages);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([
    {id: '1', name: 'Lisinopril', dosage: '10mg', time: '08:00 AM', taken: true},
    {id: '2', name: 'Metformin', dosage: '500mg', time: '02:00 PM', taken: true},
    {id: '3', name: 'Atorvastatin', dosage: '20mg', time: '09:00 PM', taken: false},
  ]);

  const reports: Report[] = [
    {
      id: 'r1',
      title: 'Comprehensive Metabolic Panel',
      date: 'June 24, 2026',
      summary: 'Glucose is normal. Cholesterol is borderline elevated. Continue diet and monitoring.',
    },
    {
      id: 'r2',
      title: 'Cardiology Follow-up',
      date: 'June 18, 2026',
      summary: 'Blood pressure remains controlled. No new symptoms reported.',
    },
  ];

  const takenCount = medications.filter((medication) => medication.taken).length;
  const adherence = Math.round((takenCount / medications.length) * 100);
  const score = useMemo(() => Math.round(70 + adherence * 0.25), [adherence]);

  const handleLogin = () => {
    setSignedIn(true);
    setActiveTab('home');
  };

  const handleLogout = () => {
    setSignedIn(false);
    setActiveTab('home');
  };

  const toggleMedication = (id: string) => {
    setMedications((current) =>
      current.map((medication) =>
        medication.id === id ? {...medication, taken: !medication.taken} : medication,
      ),
    );
  };

  const getGeminiClient = () => {
    const apiKey = process.env.EXPO_PUBLIC_SARVAM_API_KEY ?? process.env.SARVAM_API_KEY;
    if (!apiKey) {
      return null;
    }

    return apiKey;
  };

  const sendMessage = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    const replyId = `${Date.now()}-reply`;
    const history = messages.slice(-5).map((message) => ({
      sender: message.sender,
      message: message.message,
    }));

    setMessages((current) => [
      ...current,
      {id: `${Date.now()}`, sender: 'user', message: trimmed},
      {
        id: replyId,
        sender: 'assistant',
        message: 'Thinking...',
      },
    ]);
    setChatInput('');

    try {
      const apiKey = getGeminiClient();
      if (!apiKey) {
        throw new Error('Missing Sarvam API key. Set EXPO_PUBLIC_SARVAM_API_KEY for Expo Go.');
      }

      const response = await fetch('https://api.sarvam.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': apiKey,
        },
        body: JSON.stringify({
          model: 'sarvam-2b-v0.5',
          messages: [
            {
              role: 'system',
              content:
                'You are MediMind Clinical AI Companion, powered by Sarvam AI. Keep responses concise, simple, and educational. Do not diagnose or prescribe. End every answer with a short educational disclaimer.',
            },
            ...history.map((message) => ({
              role: message.sender === 'user' ? 'user' : 'assistant',
              content: message.message,
            })),
            {
              role: 'user',
              content: trimmed,
            },
          ],
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        throw new Error(`Sarvam API error (${response.status})`);
      }

      const data = await response.json();
      const replyText =
        data?.choices?.[0]?.message?.content?.trim() ||
        'I was unable to generate a response just now. Please try again.';

      setMessages((current) =>
        current.map((message) =>
          message.id === replyId
            ? { ...message, message: replyText }
            : message,
        ),
      );
    } catch (error) {
      const fallbackText =
        'I could not reach the AI service. Check that your Expo env has EXPO_PUBLIC_SARVAM_API_KEY and try again.\n\n---\nDISCLAIMER: This explanation is for educational purposes only and does not replace professional medical advice.';

      setMessages((current) =>
        current.map((message) =>
          message.id === replyId
            ? { ...message, message: fallbackText }
            : message,
        ),
      );
    } finally {
      setIsSending(false);
    }
  };

  if (!signedIn) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.authContent}>
        <View style={styles.authCard}>
          <Text style={styles.kicker}>MediMind AI</Text>
          <Text style={styles.authTitle}>Clinical patient portal</Text>
          <Text style={styles.authSubtitle}>
            Sign in to access your dashboard, medical reports, assistant, medications, and profile.
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                style={styles.passwordInput}
                secureTextEntry={!showPassword}
              />
              <Pressable style={styles.linkPill} onPress={() => setShowPassword((value) => !value)}>
                <Text style={styles.linkText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </Pressable>
            </View>
          </View>

          <Pressable style={styles.primaryButton} onPress={handleLogin}>
            <Text style={styles.primaryButtonText}>Sign in to portal</Text>
          </Pressable>

          <View style={styles.authFooterCard}>
            <Text style={styles.footerSmallTitle}>Expo Go ready</Text>
            <Text style={styles.footerSmallText}>
              This native build now shows the full mobile app shell instead of a static placeholder.
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.appShell}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        {activeTab === 'home' && (
          <View style={styles.stackGap}>
            <View style={styles.headerCard}>
              <View style={styles.headerTopRow}>
                <View>
                  <Text style={styles.kicker}>Welcome back</Text>
                  <Text style={styles.title}>Alexander Miller</Text>
                  <Text style={styles.subtleText}>Patient ID: #MM-9831</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Secured</Text>
                </View>
              </View>

              <View style={styles.scoreRow}>
                <View style={styles.scoreCircle}>
                  <Text style={styles.scoreValue}>{score}</Text>
                  <Text style={styles.scoreLabel}>of 100</Text>
                </View>
                <View style={styles.scoreMeta}>
                  <Text style={styles.scoreMetaTitle}>Interactive clinical health score</Text>
                  <Text style={styles.scoreMetaText}>
                    Medication adherence and recent activity are being tracked in the native app.
                  </Text>
                </View>
              </View>
            </View>

            <SectionCard title="Quick actions">
              <View style={styles.actionGrid}>
                {quickActions.map((action) => (
                  <Pressable key={action} style={styles.actionPill} onPress={() => setActiveTab('reports')}>
                    <Text style={styles.actionText}>{action}</Text>
                  </Pressable>
                ))}
              </View>
            </SectionCard>

            <SectionCard title="Today's medications" value={`${adherence}%`}>
              <View style={styles.medList}>
                {medications.map((medication) => (
                  <Pressable
                    key={medication.id}
                    style={[styles.medCard, medication.taken && styles.medCardTaken]}
                    onPress={() => toggleMedication(medication.id)}
                  >
                    <View>
                      <Text style={[styles.medName, medication.taken && styles.medNameTaken]}>
                        {medication.name}
                      </Text>
                      <Text style={styles.medDetails}>
                        {medication.dosage} · {medication.time}
                      </Text>
                    </View>
                    <View style={[styles.statusChip, medication.taken ? styles.statusTaken : styles.statusPending]}>
                      <Text style={styles.statusText}>{medication.taken ? 'Taken' : 'Pending'}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </SectionCard>
          </View>
        )}

        {activeTab === 'reports' && (
          <View style={styles.stackGap}>
            <SectionCard title="Recent diagnostic report" value="June 24, 2026">
              {reports.map((report) => (
                <View key={report.id} style={styles.reportCard}>
                  <Text style={styles.reportName}>{report.title}</Text>
                  <Text style={styles.reportDate}>{report.date}</Text>
                  <Text style={styles.reportText}>{report.summary}</Text>
                </View>
              ))}
            </SectionCard>

            <SectionCard title="AI report explainer">
              <Text style={styles.reportText}>
                Your recent results look stable overall. Cholesterol is still slightly elevated, so the next step is continued diet tracking and scheduled follow-up.
              </Text>
            </SectionCard>
          </View>
        )}

        {activeTab === 'assistant' && (
          <View style={styles.stackGap}>
            <SectionCard title="Clinical AI companion">
              <View style={styles.chatThread}>
                {messages.map((message) => (
                  <View
                    key={message.id}
                    style={[
                      styles.chatBubble,
                      message.sender === 'assistant' ? styles.assistantBubble : styles.userBubble,
                    ]}
                  >
                    <Text style={styles.chatText}>{message.message}</Text>
                  </View>
                ))}
                {isSending ? (
                  <View style={[styles.chatBubble, styles.assistantBubble]}>
                    <View style={styles.loadingRow}>
                      <ActivityIndicator size="small" color="#0d9488" />
                      <Text style={styles.loadingText}>MediMind is generating a reply...</Text>
                    </View>
                  </View>
                ) : null}
              </View>
            </SectionCard>

            <View style={styles.chatComposer}>
              <TextInput
                value={chatInput}
                onChangeText={setChatInput}
                placeholder="Ask about health, meds, or reports..."
                placeholderTextColor="#94a3b8"
                style={styles.chatInput}
                editable={!isSending}
              />
                <Pressable style={styles.primaryButtonSmall} onPress={sendMessage}>
                <Text style={styles.primaryButtonText}>Send</Text>
              </Pressable>
            </View>
          </View>
        )}

        {activeTab === 'meds' && (
          <View style={styles.stackGap}>
            <SectionCard title="Adherence progress" value={`${adherence}%`}>
              <Text style={styles.reportText}>
                {takenCount} of {medications.length} doses logged today.
              </Text>
            </SectionCard>

            <SectionCard title="Medication schedule">
              <View style={styles.medList}>
                {medications.map((medication) => (
                  <Pressable
                    key={medication.id}
                    style={styles.medCard}
                    onPress={() => toggleMedication(medication.id)}
                  >
                    <View>
                      <Text style={styles.medName}>{medication.name}</Text>
                      <Text style={styles.medDetails}>{medication.dosage} · {medication.time}</Text>
                    </View>
                    <Text style={styles.medAction}>{medication.taken ? 'Undo' : 'Mark taken'}</Text>
                  </Pressable>
                ))}
              </View>
            </SectionCard>
          </View>
        )}

        {activeTab === 'profile' && (
          <View style={styles.stackGap}>
            <SectionCard title="Patient profile">
              <Text style={styles.profileName}>Alexander Miller</Text>
              <Text style={styles.reportText}>Blood type: A+ · Allergies: Penicillin, Sulfonamides, Peanuts</Text>
              <Text style={styles.reportText}>Preferred pharmacy: CVS Pharmacy #4820</Text>
            </SectionCard>

            <SectionCard title="Settings">
              <SettingRow label="Push notifications" value={pushEnabled} onToggle={setPushEnabled} />
              <SettingRow label="Biometrics" value={biometricsEnabled} onToggle={setBiometricsEnabled} />
            </SectionCard>

            <Pressable style={styles.secondaryButton} onPress={handleLogout}>
              <Text style={styles.secondaryButtonText}>Log out</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        {tabOrder.map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function SectionCard({title, value, children}: {title: string; value?: string; children: React.ReactNode}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {value ? <Text style={styles.sectionValue}>{value}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function SettingRow({label, value, onToggle}: {label: string; value: boolean; onToggle: (next: boolean) => void}) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch value={value} onValueChange={onToggle} trackColor={{false: '#cbd5e1', true: '#5eead4'}} />
    </View>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    backgroundColor: '#f7faf9',
  },
  screen: {
    flex: 1,
    backgroundColor: '#f7faf9',
  },
  content: {
    padding: 16,
    paddingTop: 54,
    paddingBottom: 120,
  },
  authContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f7faf9',
  },
  authCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 14,
  },
  authTitle: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
    color: '#0f172a',
  },
  authSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#475569',
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  passwordInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
  },
  linkPill: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  linkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f766e',
  },
  primaryButton: {
    backgroundColor: '#0d9488',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonSmall: {
    backgroundColor: '#0d9488',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#e11d48',
    fontSize: 14,
    fontWeight: '800',
  },
  authFooterCard: {
    marginTop: 4,
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  footerSmallTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  footerSmallText: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
  },
  stackGap: {
    gap: 14,
  },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 6},
    elevation: 1,
    gap: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  kicker: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    color: '#0d9488',
  },
  title: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 4,
  },
  subtleText: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748b',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#ecfeff',
    borderWidth: 1,
    borderColor: '#a5f3fc',
  },
  badgeText: {
    color: '#0f766e',
    fontSize: 12,
    fontWeight: '700',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  scoreCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdfa',
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  scoreValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f766e',
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  scoreMeta: {
    flex: 1,
    gap: 4,
  },
  scoreMetaTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  scoreMetaText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#64748b',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  sectionValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0d9488',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  medList: {
    gap: 10,
  },
  medCard: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  medCardTaken: {
    backgroundColor: '#f0fdfa',
    borderColor: '#99f6e4',
  },
  medName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  medNameTaken: {
    color: '#0f766e',
  },
  medDetails: {
    marginTop: 3,
    fontSize: 12,
    color: '#64748b',
  },
  medAction: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0d9488',
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusTaken: {
    backgroundColor: '#dcfce7',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0f172a',
  },
  reportCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  reportName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  reportDate: {
    fontSize: 12,
    color: '#64748b',
  },
  reportText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#475569',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  chatThread: {
    gap: 10,
  },
  chatBubble: {
    padding: 14,
    borderRadius: 18,
    maxWidth: '92%',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#0d9488',
  },
  chatText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#0f172a',
  },
  chatComposer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#475569',
    fontStyle: 'italic',
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 14,
  },
  tabItemActive: {
    backgroundColor: '#ecfeff',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  tabLabelActive: {
    color: '#0f766e',
  },
  link: {
    color: '#0d9488',
    fontWeight: '700',
  },
});