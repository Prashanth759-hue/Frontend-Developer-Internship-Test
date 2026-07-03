import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { BorderRadius } from '../../theme/spacing';
import { useTheme } from '../../theme/ThemeContext';

interface RouteMapProps {
  pickup?: string;
  drop?: string;
  style?: ViewStyle;
}

/**
 * RouteMap — placeholder component for the embedded map view.
 * When real map integration (Google Maps / Mapbox) is added,
 * replace the View with MapView and this component becomes the wrapper.
 */
export default function RouteMap({ pickup, drop, style }: RouteMapProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: colors.surface }, style]}
      accessibilityLabel="Map view placeholder"
      accessibilityRole="image"
    >
      {/* Subtle grid lines to suggest a map */}
      <View style={styles.gridOverlay} pointerEvents="none">
        {[0, 1, 2, 3, 4].map((i) => (
          <View
            key={`h${i}`}
            style={[
              styles.gridLine,
              styles.gridLineH,
              { top: `${i * 25}%` as any, borderColor: colors.border },
            ]}
          />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <View
            key={`v${i}`}
            style={[
              styles.gridLine,
              styles.gridLineV,
              { left: `${i * 25}%` as any, borderColor: colors.border },
            ]}
          />
        ))}
      </View>

      {/* Center pin */}
      <View style={styles.center}>
        <MapPin size={36} color={Colors.primary} />
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Map view coming soon
        </Text>
      </View>

      {/* Route labels if provided */}
      {(pickup || drop) && (
        <View style={[styles.routeBar, { backgroundColor: colors.surfaceElevated }]}>
          {pickup && (
            <View style={styles.routePoint}>
              <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
              <Text style={[styles.routeText, { color: colors.textPrimary }]} numberOfLines={1}>
                {pickup}
              </Text>
            </View>
          )}
          {pickup && drop && (
            <View style={[styles.routeDivider, { backgroundColor: colors.divider }]} />
          )}
          {drop && (
            <View style={styles.routePoint}>
              <View style={[styles.dot, { backgroundColor: Colors.danger }]} />
              <Text style={[styles.routeText, { color: colors.textPrimary }]} numberOfLines={1}>
                {drop}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLine: {
    position: 'absolute',
    opacity: 0.4,
  },
  gridLineH: {
    left: 0,
    right: 0,
    borderTopWidth: 1,
  },
  gridLineV: {
    top: 0,
    bottom: 0,
    borderLeftWidth: 1,
  },
  center: {
    alignItems: 'center',
    gap: 8,
  },
  label: {
    ...Typography.caption,
  },
  routeBar: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    borderRadius: BorderRadius.md,
    padding: 10,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  routeText: {
    ...Typography.caption,
    flex: 1,
  },
  routeDivider: {
    height: 1,
    marginLeft: 16,
  },
});