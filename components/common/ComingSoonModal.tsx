import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Zap } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { BorderRadius, Spacing, Shadow } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from './Button';

interface ComingSoonModalProps {
  visible: boolean;
  featureName?: string;
  onClose: () => void;
}

export function ComingSoonModal({ visible, featureName, onClose }: ComingSoonModalProps) {
  const { colors } = useTheme();

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.card, { backgroundColor: colors.surface }, Shadow.lg]}>
              <View style={[styles.iconWrapper, { backgroundColor: colors.iconBg }]}>
                <Zap size={30} color={Colors.primary} fill={Colors.primary} />
              </View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>Coming Soon</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {featureName
                  ? `${featureName} is being built and will launch soon.`
                  : 'This feature is being built and will launch soon.'}
              </Text>
              <Button label="Got it" onPress={onClose} style={styles.button} />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

export function useComingSoon() {
  const [state, setState] = React.useState<{ visible: boolean; feature?: string }>({ visible: false });
  const show = (feature?: string) => setState({ visible: true, feature });
  const hide = () => setState({ visible: false });
  const modal = <ComingSoonModal visible={state.visible} featureName={state.feature} onClose={hide} />;
  return { show, hide, modal };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center', padding: 28,
  },
  card: {
    width: '100%', maxWidth: 340, borderRadius: BorderRadius.xxl,
    padding: 28, alignItems: 'center', gap: Spacing.md,
  },
  iconWrapper: {
    width: 68, height: 68, borderRadius: 34,
    justifyContent: 'center', alignItems: 'center', marginBottom: 4,
  },
  title: { ...Typography.h2, textAlign: 'center' },
  subtitle: { ...Typography.body, textAlign: 'center', lineHeight: 22 },
  button: { width: '100%', marginTop: 8 },
});