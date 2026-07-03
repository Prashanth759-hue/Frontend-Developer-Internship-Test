import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Clock, Check, Users } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../theme/LanguageContext';
import { Button } from '../../components/common/Button';
import { useBookingStore } from '../../store/bookingStore';
import { PACKERS_MOVERS_PACKAGES, PACKING_MATERIAL_PRICE } from '../../constants/mockData';
import HOME_BG from '../../assets/bg/homeBg';

const PACKAGE_IMAGES: Record<string, ImageSourcePropType> = {
  mini_truck: require('../../assets/images/icon-mini-truck.png'),
  truck: require('../../assets/images/truck.png'),
};

export default function PackersMoversVehicleScreen() {
  const { colors, isDark} = useTheme();
  const styles = makeStyles(colors);
  const { t } = useLanguage();
  const { setSelectedVehicle, setEstimatedFare, setHelperCount } = useBookingStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [packingMaterial, setPackingMaterial] = useState(false);

  const selectedPackage = PACKERS_MOVERS_PACKAGES.find((p) => p.id === selected) ?? null;
  const totalFare = selectedPackage
    ? selectedPackage.fare + (packingMaterial ? PACKING_MATERIAL_PRICE : 0)
    : 0;

  const handleContinue = () => {
    if (!selectedPackage) return;
    setSelectedVehicle(selectedPackage.id);
    setEstimatedFare(totalFare);
    setHelperCount(selectedPackage.helpers);
    router.push('/(booking)/fare');
  };

  return (
    <ImageBackground
      source={HOME_BG}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? colors.background : 'transparent' }]}>
        {/* ── Hero Header ── */}
        <View style={styles.heroHeader}>
          <View style={styles.heroTopRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={20} color="#FF6B00" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>{t('chooseVehicle')}</Text>
              <Text style={styles.heroSubtitle}>Select based on home or office size</Text>
            </View>
          </View>

          <View style={styles.chipsRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>🛡️ Verified moving team</Text>
            </View>
          </View>
        </View>

        <FlatList
          data={PACKERS_MOVERS_PACKAGES}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isActive = selected === item.id;
            return (
              <TouchableOpacity
                style={[styles.vehicleCard, isActive && styles.vehicleCardActive]}
                onPress={() => setSelected(item.id)}
                accessibilityLabel={`Select ${item.name}, ₹${item.fare}, ETA ${item.eta}`}
                activeOpacity={0.85}
              >
                <Image
                  source={PACKAGE_IMAGES[item.icon] ?? PACKAGE_IMAGES.mini_truck}
                  style={styles.vehicleImage}
                />

                <View style={styles.vehicleInfo}>
                  <Text style={[styles.vehicleName, { color: colors.textPrimary }]}>{item.name}</Text>
                  <Text style={[styles.vehicleDesc, { color: colors.textSecondary }]}>{item.description}</Text>
                  <View style={styles.metaRow}>
                    <View style={styles.helpersBadge}>
                      <Users size={11} color={Colors.primary} />
                      <Text style={styles.helpersBadgeText}>{item.helpers} helpers</Text>
                    </View>
                    <Clock size={12} color={Colors.primary} />
                    <Text style={styles.etaText}>{item.eta}</Text>
                  </View>
                </View>

                <View style={styles.fareArea}>
                  <Text style={[styles.fareText, isActive && styles.fareTextActive]}>₹{item.fare}</Text>
                  {isActive && (
                    <View style={styles.checkCircle}>
                      <Check size={12} color={Colors.white} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListFooterComponent={
            <View style={styles.footer}>
              {/* ── Packing Material Add-on ── */}
              <TouchableOpacity
                style={[styles.packingCard, packingMaterial && styles.packingCardActive]}
                onPress={() => setPackingMaterial((v) => !v)}
                activeOpacity={0.85}
                accessibilityLabel="Add packing material"
                accessibilityState={{ selected: packingMaterial }}
              >
                <Image
                  source={require('../../assets/images/icon-box-pallet.png')}
                  style={styles.packingImage}
                />
                <View style={styles.packingInfo}>
                  <Text style={[styles.packingTitle, { color: colors.textPrimary }]}>
                    Add Packing Material
                  </Text>
                  <Text style={[styles.packingDesc, { color: colors.textSecondary }]}>
                    Boxes, bubble wrap & tape for safe packing
                  </Text>
                </View>
                <View style={styles.packingRight}>
                  <Text style={styles.packingPrice}>+ ₹{PACKING_MATERIAL_PRICE}</Text>
                  <View style={[styles.checkbox, packingMaterial && styles.checkboxActive]}>
                    {packingMaterial && <Check size={12} color={Colors.white} />}
                  </View>
                </View>
              </TouchableOpacity>

              <Button
                label={selectedPackage ? `Confirm Package · ₹${totalFare}` : 'Confirm Package'}
                onPress={handleContinue}
                disabled={!selectedPackage}
                style={{ width: '100%' }}
                accessibilityLabel="Confirm selected package"
              />
            </View>
          }
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const makeStyles = (colors: any) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  backgroundImage: {
    flex: 1,
  },

  heroHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,

    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,

    overflow: 'hidden',

    backgroundColor: colors.surfaceElevated,

    marginBottom: 16,
  },

  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,

    backgroundColor: colors.surface,

    borderWidth: 1,
    borderColor: colors.iconBorder,

    justifyContent: 'center',
    alignItems: 'center',
  },

  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FF6B00',
    letterSpacing: -0.5,
  },

  heroSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },

  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },

  chip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },

  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF6B00',
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },

  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 24,
    padding: 16,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    shadowColor: '#FF6B00',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  vehicleCardActive: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: colors.subtleBg,
  },

  vehicleImage: {
    width: 72,
    height: 72,
    resizeMode: 'contain',
  },

  vehicleInfo: {
    flex: 1,
    gap: 3,
  },

  vehicleName: {
    fontSize: 16,
    fontWeight: '700',
  },

  vehicleDesc: {
    fontSize: 12,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    flexWrap: 'wrap',
  },

  helpersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.iconBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
  },

  helpersBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },

  etaText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },

  fareArea: {
    alignItems: 'flex-end',
    gap: 8,
  },

  fareText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },

  fareTextActive: {
    color: Colors.primary,
  },

  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  footer: {
    paddingTop: 4,
    paddingBottom: 32,
    gap: 14,
  },

  packingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    shadowColor: '#FF6B00',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  packingCardActive: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: colors.subtleBg,
  },

  packingImage: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },

  packingInfo: {
    flex: 1,
    gap: 2,
  },

  packingTitle: {
    fontSize: 14,
    fontWeight: '700',
  },

  packingDesc: {
    fontSize: 12,
  },

  packingRight: {
    alignItems: 'flex-end',
    gap: 8,
  },

  packingPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.iconBorder,
    backgroundColor: colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
})
;