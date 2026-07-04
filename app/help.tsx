import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ImageBackground, LayoutAnimation, Platform, UIManager,
  TextInput, Modal, Alert, KeyboardAvoidingView, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronDown, ChevronUp, MessageCircle, Phone, Search, X, FileText, CheckCircle, Send, Clock } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../theme/LanguageContext';
import { FAQ_ITEMS } from '../constants/mockData';
import HOME_BG from '../assets/bg/homeBg';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const ISSUE_CATEGORIES = [
  'Booking Issue',
  'Payment Problem',
  'Driver Behaviour',
  'Lost Item',
  'Overcharging',
  'App Technical Issue',
  'Other',
];

export default function HelpScreen() {
  const { colors, isDark} = useTheme();
  const styles = makeStyles(colors);
  const { t } = useLanguage();
  const params = useLocalSearchParams<{ openTicket?: string; openChat?: string; category?: string; subject?: string }>();

  const [openId, setOpenId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Ticket form state
  const [showTicketModal, setShowTicketModal] = useState(params.openTicket === '1');
  const [ticketCategory, setTicketCategory] = useState(params.category ?? '');
  const [ticketSubject, setTicketSubject] = useState(params.subject ?? '');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  // Live chat state
  const [showChatModal, setShowChatModal] = useState(params.openChat === '1');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ from: 'user' | 'agent'; text: string; time: string }[]>([
    { from: 'agent', text: 'Hi! Welcome to Vahan360 support. How can I help you today?', time: now() },
  ]);
  const [agentTyping, setAgentTyping] = useState(false);

  function now() {
    const d = new Date();
    return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
  }

  const AGENT_REPLIES = [
    "I understand your concern. Let me look into this for you.",
    "Thank you for reaching out! Can you please share more details?",
    "I've noted your issue. Our team will resolve this within 24 hours.",
    "Sorry for the inconvenience. I'm escalating this to our specialist team.",
    "Is there anything else I can help you with?",
  ];

  const sendChat = () => {
    const text = chatInput.trim();
    if (!text) return;
    const userMsg = { from: 'user' as const, text, time: now() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setAgentTyping(true);
    setTimeout(() => {
      const reply = AGENT_REPLIES[Math.floor(Math.random() * AGENT_REPLIES.length)];
      setChatMessages(prev => [...prev, { from: 'agent', text: reply, time: now() }]);
      setAgentTyping(false);
    }, 1500);
  };

  const handleCallSupport = () => {
    const phone = 'tel:+918001234567';
    Linking.canOpenURL(phone).then(supported => {
      if (supported) {
        Linking.openURL(phone);
      } else {
        Alert.alert(
          'Call Support',
          'Our support team is available 24/7.\n\nPhone: +91 800 123 4567\n\nYou can also raise a ticket or use Live Chat for instant help.',
          [
            { text: 'Raise a Ticket', onPress: () => setShowTicketModal(true) },
            { text: 'OK', style: 'cancel' },
          ]
        );
      }
    });
  };

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((prev) => (prev === id ? null : id));
  };

  const filteredFAQs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return FAQ_ITEMS;
    return FAQ_ITEMS.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSubmitTicket = () => {
    if (!ticketCategory) {
      Alert.alert('Required', 'Please select an issue category.');
      return;
    }
    if (!ticketSubject.trim()) {
      Alert.alert('Required', 'Please enter a subject for your issue.');
      return;
    }
    if (!ticketDescription.trim() || ticketDescription.trim().length < 20) {
      Alert.alert('Required', 'Please describe your issue in at least 20 characters.');
      return;
    }
    const id = 'TKT-' + Math.floor(100000 + Math.random() * 900000);
    setTicketId(id);
    setTicketSubmitted(true);
  };

  const resetTicket = () => {
    setTicketCategory('');
    setTicketSubject('');
    setTicketDescription('');
    setTicketSubmitted(false);
    setTicketId('');
    setShowTicketModal(false);
  };

  return (
    <ImageBackground
      source={HOME_BG}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? colors.background : 'transparent' }]}>

        {/* Hero */}
        <View style={styles.heroHeader}>
          <View style={styles.heroTopRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={20} color="#FF6B00" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>{t('helpSupport')}</Text>
              <Text style={styles.heroSubtitle}>We're here to help you</Text>
            </View>
          </View>

          {/* Search Bar */}
          <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
            <Search size={18} color="#9CA3AF" />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search help topics…"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Contact chips */}
          <View style={styles.contactRow}>
            <TouchableOpacity
              style={styles.contactChip}
              onPress={() => setShowChatModal(true)}
            >
              <MessageCircle size={16} color={Colors.primary} />
              <Text style={styles.contactChipText}>Live Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactChip}
              onPress={handleCallSupport}
            >
              <Phone size={16} color={Colors.primary} />
              <Text style={styles.contactChipText}>Call Support</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.contactChip, styles.ticketChip]}
              onPress={() => setShowTicketModal(true)}
            >
              <FileText size={16} color="#FFFFFF" />
              <Text style={[styles.contactChipText, { color: colors.surface }]}>Raise Ticket</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.sectionTitle}>
            {searchQuery.trim()
              ? `Results for "${searchQuery.trim()}" (${filteredFAQs.length})`
              : 'Frequently Asked Questions'}
          </Text>

          {filteredFAQs.length === 0 ? (
            <View style={styles.noResultsBox}>
              <Text style={styles.noResultsIcon}>🔍</Text>
              <Text style={[styles.noResultsTitle, { color: colors.textPrimary }]}>No results found</Text>
              <Text style={[styles.noResultsSub, { color: colors.textSecondary }]}>
                Try different keywords or raise a support ticket.
              </Text>
              <TouchableOpacity
                style={styles.noResultsBtn}
                onPress={() => setShowTicketModal(true)}
              >
                <Text style={styles.noResultsBtnText}>Raise a Ticket</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredFAQs.map((item) => {
              const isOpen = openId === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.faqCard, isOpen && styles.faqCardOpen]}
                  onPress={() => toggle(item.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.faqHeader}>
                    <Text style={[styles.faqQuestion, { color: colors.textPrimary }]}>
                      {item.question}
                    </Text>
                    {isOpen
                      ? <ChevronUp size={18} color={Colors.primary} />
                      : <ChevronDown size={18} color="#9CA3AF" />}
                  </View>
                  {isOpen && (
                    <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                      {item.answer}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })
          )}

          {/* Contact card */}
          <View style={styles.contactCard}>
            <Text style={styles.contactCardTitle}>Still need help?</Text>
            <Text style={styles.contactCardSub}>Our support team is available 24/7</Text>
            <View style={styles.contactBtnsRow}>
              <TouchableOpacity
                style={styles.contactBtn}
                onPress={() => setShowChatModal(true)}
              >
                <MessageCircle size={18} color="#FFF" />
                <Text style={styles.contactBtnText}>Chat Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.contactBtn, styles.contactBtnOutline]}
                onPress={handleCallSupport}
              >
                <Phone size={18} color={Colors.primary} />
                <Text style={[styles.contactBtnText, { color: Colors.primary }]}>Call Us</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Support Ticket Modal */}
        <Modal
          visible={showTicketModal}
          transparent
          animationType="slide"
          onRequestClose={resetTicket}
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.ticketSheet, { backgroundColor: colors.surface }]}>
                <View style={styles.sheetHandle} />

                {ticketSubmitted ? (
                  // ── Success State ─────────────────────────────────
                  <View style={styles.successBox}>
                    <View style={styles.successIconWrap}>
                      <CheckCircle size={56} color={Colors.primary} />
                    </View>
                    <Text style={[styles.successTitle, { color: colors.textPrimary }]}>
                      Ticket Created!
                    </Text>
                    <Text style={[styles.successSub, { color: colors.textSecondary }]}>
                      Your support ticket has been submitted successfully. Our team will respond within 24 hours.
                    </Text>
                    <View style={styles.ticketIdBox}>
                      <Text style={styles.ticketIdLabel}>Ticket ID</Text>
                      <Text style={styles.ticketIdValue}>{ticketId}</Text>
                    </View>
                    <TouchableOpacity style={styles.doneBtn} onPress={resetTicket}>
                      <Text style={styles.doneBtnText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  // ── Form State ─────────────────────────────────────
                  <>
                    <View style={styles.ticketSheetHeader}>
                      <Text style={[styles.ticketSheetTitle, { color: colors.textPrimary }]}>
                        Raise a Support Ticket
                      </Text>
                      <TouchableOpacity onPress={resetTicket} style={styles.closeBtn}>
                        <X size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                      {/* Category */}
                      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                        Issue Category *
                      </Text>
                      <View style={styles.categoryGrid}>
                        {ISSUE_CATEGORIES.map((cat) => (
                          <TouchableOpacity
                            key={cat}
                            style={[
                              styles.categoryChip,
                              ticketCategory === cat && styles.categoryChipActive,
                            ]}
                            onPress={() => setTicketCategory(cat)}
                          >
                            <Text
                              style={[
                                styles.categoryChipText,
                                ticketCategory === cat && styles.categoryChipTextActive,
                              ]}
                            >
                              {cat}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      {/* Subject */}
                      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                        Subject *
                      </Text>
                      <TextInput
                        style={[
                          styles.textField,
                          { backgroundColor: colors.surface, borderColor: colors.cardBorder, color: colors.textPrimary },
                        ]}
                        placeholder="Brief title of your issue"
                        placeholderTextColor="#9CA3AF"
                        value={ticketSubject}
                        onChangeText={setTicketSubject}
                        maxLength={100}
                      />

                      {/* Description */}
                      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                        Description *
                      </Text>
                      <TextInput
                        style={[
                          styles.textField,
                          styles.textArea,
                          { backgroundColor: colors.surface, borderColor: colors.cardBorder, color: colors.textPrimary },
                        ]}
                        placeholder="Describe your issue in detail (min. 20 characters)"
                        placeholderTextColor="#9CA3AF"
                        value={ticketDescription}
                        onChangeText={setTicketDescription}
                        multiline
                        numberOfLines={5}
                        maxLength={500}
                        textAlignVertical="top"
                      />
                      <Text style={[styles.charCount, { color: colors.textSecondary }]}>
                        {ticketDescription.length}/500
                      </Text>
                    </ScrollView>

                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitTicket}>
                      <FileText size={18} color="#FFFFFF" />
                      <Text style={styles.submitBtnText}>Submit Ticket</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
        {/* Live Chat Modal */}
        <Modal visible={showChatModal} transparent animationType="slide" onRequestClose={() => setShowChatModal(false)}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.modalOverlay}>
              <View style={[styles.ticketSheet, styles.chatSheet, { backgroundColor: colors.surface }]}>
                <View style={styles.sheetHandle} />

                {/* Chat header */}
                <View style={styles.ticketSheetHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={styles.agentAvatar}>
                      <Text style={styles.agentAvatarText}>V</Text>
                    </View>
                    <View>
                      <Text style={[styles.ticketSheetTitle, { color: colors.textPrimary, fontSize: 16 }]}>
                        Vahan360 Support
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <View style={styles.onlineDot} />
                        <Text style={[styles.charCount, { color: '#16A34A', marginTop: 0 }]}>Online · Typically replies instantly</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setShowChatModal(false)} style={styles.closeBtn}>
                    <X size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Messages */}
                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={{ padding: 16, gap: 12 }}
                  showsVerticalScrollIndicator={false}
                >
                  {chatMessages.map((msg, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.chatBubbleWrap,
                        msg.from === 'user' && styles.chatBubbleWrapUser,
                      ]}
                    >
                      {msg.from === 'agent' && (
                        <View style={[styles.agentAvatar, styles.agentAvatarSmall]}>
                          <Text style={[styles.agentAvatarText, { fontSize: 10 }]}>V</Text>
                        </View>
                      )}
                      <View>
                        <View style={[
                          styles.chatBubble,
                          msg.from === 'user' ? styles.chatBubbleUser : [styles.chatBubbleAgent, { backgroundColor: colors.iconBg, borderColor: colors.iconBorder }],
                        ]}>
                          <Text style={[styles.chatBubbleText, { color: msg.from === 'user' ? '#fff' : colors.textPrimary }]}>
                            {msg.text}
                          </Text>
                        </View>
                        <Text style={[styles.chatTime, msg.from === 'user' && { textAlign: 'right' }]}>{msg.time}</Text>
                      </View>
                    </View>
                  ))}
                  {agentTyping && (
                    <View style={styles.chatBubbleWrap}>
                      <View style={[styles.agentAvatar, styles.agentAvatarSmall]}>
                        <Text style={[styles.agentAvatarText, { fontSize: 10 }]}>V</Text>
                      </View>
                      <View style={[styles.chatBubble, styles.chatBubbleAgent, { backgroundColor: colors.iconBg, borderColor: colors.iconBorder }]}>
                        <Text style={{ color: colors.placeholder, fontSize: 18, letterSpacing: 4 }}>•••</Text>
                      </View>
                    </View>
                  )}
                </ScrollView>

                {/* Input */}
                <View style={[styles.chatInputRow, { borderTopColor: colors.divider, backgroundColor: colors.surface }]}>
                  <TextInput
                    style={[styles.chatInput, { backgroundColor: colors.inputBackground, color: colors.textPrimary, borderColor: colors.cardBorder }]}
                    placeholder="Type a message…"
                    placeholderTextColor="#9CA3AF"
                    value={chatInput}
                    onChangeText={setChatInput}
                    returnKeyType="send"
                    onSubmitEditing={sendChat}
                  />
                  <TouchableOpacity
                    style={[styles.chatSendBtn, !chatInput.trim() && { opacity: 0.5 }]}
                    onPress={sendChat}
                    disabled={!chatInput.trim()}
                  >
                    <Send size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

      </SafeAreaView>
    </ImageBackground>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  safe: { flex: 1, backgroundColor: 'transparent' },

  heroHeader: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    overflow: 'hidden', backgroundColor: colors.surfaceElevated, marginBottom: 16, gap: 12,
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.iconBorder, justifyContent: 'center', alignItems: 'center',
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#FF6B00', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginTop: 2 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: colors.iconBorder,
  },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '500' },

  contactRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  contactChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.surface, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: colors.iconBorder,
  },
  ticketChip: { backgroundColor: '#FF6B00', borderColor: '#FF6B00' },
  contactChipText: { fontSize: 13, fontWeight: '700', color: '#FF6B00' },

  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#FF6B00', marginBottom: 4 },

  noResultsBox: {
    alignItems: 'center', padding: 32, gap: 10,
    backgroundColor: colors.surface, borderRadius: 24,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  noResultsIcon: { fontSize: 40 },
  noResultsTitle: { fontSize: 18, fontWeight: '800' },
  noResultsSub: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  noResultsBtn: {
    marginTop: 8, backgroundColor: '#FF6B00', borderRadius: 16,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  noResultsBtnText: { fontSize: 14, fontWeight: '700', color: colors.surface },

  faqCard: {
    backgroundColor: colors.surface, borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: colors.cardBorder,
    shadowColor: '#FF6B00', shadowOpacity: 0.06, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 3, gap: 0,
  },
  faqCardOpen: { borderColor: '#FF6B00' },
  faqHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  faqQuestion: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  faqAnswer: {
    fontSize: 13, lineHeight: 20, marginTop: 12,
    paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.cardBorder,
  },

  contactCard: {
    backgroundColor: colors.iconBg, borderRadius: 24, padding: 20, marginTop: 8,
    borderWidth: 1, borderColor: colors.iconBorder, alignItems: 'center', gap: 8,
  },
  contactCardTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  contactCardSub: { fontSize: 13, color: colors.textSecondary, marginBottom: 4 },
  contactBtnsRow: { flexDirection: 'row', gap: 12, width: '100%' },
  contactBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#FF6B00', borderRadius: 16, paddingVertical: 14,
  },
  contactBtnOutline: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: '#FF6B00' },
  contactBtnText: { fontSize: 14, fontWeight: '700', color: colors.surface },

  // Ticket Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  ticketSheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40, height: '85%',
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border,
    alignSelf: 'center', marginBottom: 16,
  },
  ticketSheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
  },
  ticketSheetTitle: { fontSize: 20, fontWeight: '800' },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.divider,
    justifyContent: 'center', alignItems: 'center',
  },

  fieldLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, marginBottom: 8, marginTop: 16 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.divider, borderWidth: 1, borderColor: colors.border,
  },
  categoryChipActive: { backgroundColor: colors.iconBg, borderColor: '#FF6B00' },
  categoryChipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  categoryChipTextActive: { color: '#FF6B00' },

  textField: {
    borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, fontWeight: '500',
  },
  textArea: { minHeight: 120, paddingTop: 12 },
  charCount: { fontSize: 11, textAlign: 'right', marginTop: 4 },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#FF6B00', borderRadius: 16, paddingVertical: 16, marginTop: 20,
  },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: colors.surface },

  // Success
  successBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16, gap: 12 },
  successIconWrap: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: colors.iconBg,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#FF6B00',
  },
  successTitle: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
  successSub: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  ticketIdBox: {
    backgroundColor: colors.iconBg, borderRadius: 16, paddingHorizontal: 24,
    paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.iconBorder,
    gap: 4, width: '100%',
  },
  ticketIdLabel: { fontSize: 11, fontWeight: '700', color: colors.placeholder, letterSpacing: 0.8 },
  ticketIdValue: { fontSize: 22, fontWeight: '800', color: '#FF6B00' },
  doneBtn: {
    backgroundColor: '#FF6B00', borderRadius: 16, paddingVertical: 14,
    paddingHorizontal: 48, marginTop: 8,
  },
  doneBtnText: { fontSize: 15, fontWeight: '700', color: colors.surface },

  // Live Chat
  chatSheet: { height: '88%', paddingBottom: 0 },
  agentAvatar: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  agentAvatarSmall: { width: 28, height: 28, borderRadius: 14, alignSelf: 'flex-end' },
  agentAvatarText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  onlineDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#16A34A' },
  chatBubbleWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  chatBubbleWrapUser: { flexDirection: 'row-reverse' },
  chatBubble: {
    maxWidth: '80%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1,
  },
  chatBubbleAgent: { borderBottomLeftRadius: 4 },
  chatBubbleUser: { backgroundColor: Colors.primary, borderColor: Colors.primary, borderBottomRightRadius: 4 },
  chatBubbleText: { fontSize: 14, lineHeight: 20 },
  chatTime: { fontSize: 10, color: colors.placeholder, marginTop: 3, marginHorizontal: 4 },
  chatInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1,
  },
  chatInput: {
    flex: 1, borderRadius: 22, borderWidth: 1,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 14,
  },
  chatSendBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
})
;