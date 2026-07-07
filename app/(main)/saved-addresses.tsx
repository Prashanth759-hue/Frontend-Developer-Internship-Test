import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Home,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../theme/LanguageContext';
import { Button } from '../../components/common/Button';
import { useSavedAddressStore, type AddressIconKey } from '../../store/savedAddressStore';
import { validateAddressLabel, validateAddress } from '../../utils/validators';
import HOME_BG from '../../assets/bg/homeBg';

type AddressIcon = AddressIconKey;

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  icon: AddressIcon;
}

const ICON_OPTIONS: { key: AddressIcon; label: string; Icon: any }[] = [
  { key: 'home', label: 'Home', Icon: Home },
  { key: 'briefcase', label: 'Work', Icon: Briefcase },
  { key: 'map-pin', label: 'Other', Icon: MapPin },
];

function AddressIcon({ icon, size = 18, color }: { icon: AddressIcon; size?: number; color: string }) {
  if (icon === 'home') return <Home size={size} color={color} />;
  if (icon === 'briefcase') return <Briefcase size={size} color={color} />;
  return <MapPin size={size} color={color} />;
}

export default function SavedAddressesScreen() {
  const { colors, isDark} = useTheme();
  const styles = makeStyles(colors);

  const { addresses, addAddress, updateAddress, removeAddress } = useSavedAddressStore();
  const { t } = useLanguage();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [labelText, setLabelText] = useState('');
  const [addressText, setAddressText] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<AddressIcon>('map-pin');

  // Validation errors
  const [labelError, setLabelError] = useState('');
  const [addressError, setAddressError] = useState('');

  const openAdd = () => {
    setEditingId(null);
    setLabelText('');
    setAddressText('');
    setSelectedIcon('map-pin');
    setLabelError('');
    setAddressError('');
    setShowModal(true);
  };

  const openEdit = (addr: SavedAddress) => {
    setEditingId(addr.id);
    setLabelText(addr.label);
    setAddressText(addr.address);
    setSelectedIcon(addr.icon);
    setLabelError('');
    setAddressError('');
    setShowModal(true);
  };

  const handleLabelChange = (text: string) => {
    setLabelText(text.slice(0, 40));
    if (labelError) setLabelError('');
  };

  const handleAddressChange = (text: string) => {
    setAddressText(text.slice(0, 300));
    if (addressError) setAddressError('');
  };

  const handleSave = () => {
    let hasError = false;

    const labelRes = validateAddressLabel(labelText);
    if (!labelRes.valid) { setLabelError(labelRes.error ?? 'Invalid label'); hasError = true; }

    const addressRes = validateAddress(addressText);
    if (!addressRes.valid) { setAddressError(addressRes.error ?? 'Invalid address'); hasError = true; }

    if (hasError) return;

    if (editingId) {
      updateAddress(editingId, {
        label: labelText.trim(),
        address: addressText.trim(),
        icon: selectedIcon,
      });
    } else {
      addAddress({
        label: labelText.trim(),
        address: addressText.trim(),
        icon: selectedIcon,
      });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string, label: string) => {
    Alert.alert(
      t('confirmDelete'),
      `Remove "${label}" from saved addresses?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => removeAddress(id),
        },
      ]
    );
  };

  const canSave =
    validateAddressLabel(labelText).valid && validateAddress(addressText).valid;

  return (
    <ImageBackground
      source={HOME_BG}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? colors.background : 'transparent' }]}>
        {/* Hero Header */}
        <View style={styles.heroHeader}>
          <View style={styles.heroTopRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={20} color="#FF6B00" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>{t('savedAddressesTitle')}</Text>
              <Text style={styles.heroSubtitle}>Your frequently used locations</Text>
            </View>
            <TouchableOpacity onPress={openAdd} style={styles.addBtn}>
              <Plus size={18} color="#FF6B00" />
            </TouchableOpacity>
          </View>
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipText}>📍 Quick pickup</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>⚡ Faster booking</Text></View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {addresses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📍</Text>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No saved addresses</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {t('savedAddressesHint')}
              </Text>
              <TouchableOpacity style={styles.emptyAddBtn} onPress={openAdd}>
                <Plus size={16} color="#FF6B00" />
                <Text style={styles.emptyAddText}>{t('addAddress')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {addresses.map((addr) => (
                <View key={addr.id} style={styles.addressCard}>
                  <View style={styles.addressIconWrap}>
                    <AddressIcon icon={addr.icon} size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.addressInfo}>
                    <Text style={[styles.addressLabel, { color: colors.textPrimary }]}>
                      {addr.label}
                    </Text>
                    <Text style={[styles.addressText, { color: colors.textSecondary }]} numberOfLines={2}>
                      {addr.address}
                    </Text>
                  </View>
                  <View style={styles.addressActions}>
                    <TouchableOpacity
                      onPress={() => openEdit(addr)}
                      style={styles.actionBtn}
                      accessibilityLabel={`Edit ${addr.label}`}
                    >
                      <Pencil size={16} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(addr.id, addr.label)}
                      style={[styles.actionBtn, styles.actionBtnDanger]}
                      accessibilityLabel={`Delete ${addr.label}`}
                    >
                      <Trash2 size={16} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <TouchableOpacity style={styles.addMoreBtn} onPress={openAdd}>
                <View style={styles.addMoreIcon}>
                  <Plus size={16} color={Colors.primary} />
                </View>
                <Text style={styles.addMoreText}>Add Another Address</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              {t('savedAddressesProTip')}
            </Text>
          </View>
        </ScrollView>

        {/* Add / Edit Modal */}
        <Modal
          visible={showModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.bottomSheet, { backgroundColor: colors.surface }]}>
              <View style={styles.sheetHandle} />

              <View style={styles.sheetHeaderRow}>
                <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>
                  {editingId ? t('editAddress') : t('addAddress')}
                </Text>
                <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeBtn}>
                  <X size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Icon picker */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>TYPE</Text>
              <View style={styles.iconPickerRow}>
                {ICON_OPTIONS.map((opt) => {
                  const active = selectedIcon === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      style={[styles.iconOption, active && styles.iconOptionActive]}
                      onPress={() => {
                        setSelectedIcon(opt.key);
                        if (!editingId && !labelText) setLabelText(opt.label);
                      }}
                    >
                      <opt.Icon size={20} color={active ? Colors.primary : colors.textSecondary} />
                      <Text style={[styles.iconOptionLabel, active && styles.iconOptionLabelActive]}>
                        {opt.label}
                      </Text>
                      {active && (
                        <View style={styles.iconCheck}>
                          <Check size={10} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Label */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>LABEL</Text>
              <View style={[styles.inputBox, { borderColor: labelError ? Colors.danger : labelText ? Colors.primary : colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="e.g. Home, Work, Mom's place"
                  placeholderTextColor={colors.placeholder}
                  value={labelText}
                  onChangeText={handleLabelChange}
                  maxLength={40}
                />
              </View>
              {labelError ? <Text style={styles.errorText}>{labelError}</Text> : null}

              {/* Address */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>ADDRESS</Text>
              <View style={[styles.inputBox, styles.inputBoxMultiline, { borderColor: addressError ? Colors.danger : addressText ? Colors.primary : colors.border }]}>
                <TextInput
                  style={[styles.input, styles.inputMultiline, { color: colors.textPrimary }]}
                  placeholder="Full address with landmark (min 5 characters)"
                  placeholderTextColor={colors.placeholder}
                  value={addressText}
                  onChangeText={handleAddressChange}
                  multiline
                  numberOfLines={3}
                  maxLength={300}
                />
              </View>
              {addressError ? <Text style={styles.errorText}>{addressError}</Text> : null}

              <Button
                label={editingId ? t('save') : t('addAddress')}
                onPress={handleSave}
                disabled={!canSave}
                style={{ marginTop: 8 }}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },

  heroHeader: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    overflow: 'hidden', backgroundColor: colors.surfaceElevated, marginBottom: 16,
    gap: 12,
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.iconBorder, justifyContent: 'center', alignItems: 'center',
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#FF6B00', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginTop: 2 },
  addBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.iconBorder, justifyContent: 'center', alignItems: 'center',
  },
  chipsRow: { flexDirection: 'row', gap: 8 },
  chip: {
    backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  chipText: { fontSize: 11, fontWeight: '600', color: '#FF6B00' },

  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },

  addressCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.surface, borderRadius: 20, padding: 16,
    borderWidth: 1.5, borderColor: colors.cardBorder,
    shadowColor: '#FF6B00', shadowOpacity: 0.07, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  addressIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.iconBg, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.iconBorder,
  },
  addressInfo: { flex: 1, gap: 3 },
  addressLabel: { fontSize: 15, fontWeight: '700' },
  addressText: { fontSize: 12, lineHeight: 17 },
  addressActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.iconBg, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.iconBorder,
  },
  actionBtnDanger: { backgroundColor: '#FFF0F0', borderColor: '#FFCDD2' },

  addMoreBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.surface, borderRadius: 20, padding: 16,
    borderWidth: 1.5, borderColor: colors.cardBorder, borderStyle: 'dashed',
  },
  addMoreIcon: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.iconBg, justifyContent: 'center', alignItems: 'center',
  },
  addMoreText: { fontSize: 14, fontWeight: '600', color: Colors.primary },

  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 19, paddingHorizontal: 24 },
  emptyAddBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 8, backgroundColor: colors.iconBg, paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 20, borderWidth: 1, borderColor: colors.iconBorder,
  },
  emptyAddText: { fontSize: 14, fontWeight: '700', color: Colors.primary },

  infoCard: {
    backgroundColor: colors.subtleBg, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  infoText: { fontSize: 13, lineHeight: 19, color: '#F59E0B' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  bottomSheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 48, gap: 12,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border,
    alignSelf: 'center', marginBottom: 8,
  },
  sheetHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4,
  },
  sheetTitle: { fontSize: 20, fontWeight: '800' },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.divider, justifyContent: 'center', alignItems: 'center',
  },

  fieldLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: -4 },

  iconPickerRow: { flexDirection: 'row', gap: 10 },
  iconOption: {
    flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12,
    borderRadius: 16, borderWidth: 1.5, borderColor: colors.cardBorder,
    backgroundColor: colors.inputBackground, position: 'relative',
  },
  iconOptionActive: { borderColor: Colors.primary, backgroundColor: colors.subtleBg },
  iconOptionLabel: { fontSize: 12, fontWeight: '600', color: colors.placeholder },
  iconOptionLabelActive: { color: Colors.primary },
  iconCheck: {
    position: 'absolute', top: 6, right: 6,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },

  inputBox: {
    borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 4,
    backgroundColor: colors.inputBackground,
  },
  inputBoxMultiline: { paddingVertical: 10 },
  input: { fontSize: 15, paddingVertical: 10 },
  inputMultiline: { minHeight: 72, textAlignVertical: 'top' },
  errorText: { fontSize: 12, color: Colors.danger, marginTop: -6, marginLeft: 4 },
})
;