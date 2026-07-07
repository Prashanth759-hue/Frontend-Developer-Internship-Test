import React, { useRef, useEffect, useState } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  View,
  Dimensions,
  ViewStyle,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HANDLE_HEIGHT = 24;

export type SheetSnapPoint = 'collapsed' | 'default' | 'expanded';

interface DraggableSheetProps {
  /** Fraction of screen height (0–1) visible at the default resting position. */
  defaultHeight?: number;
  /**
   * Upper bound on how far the sheet can expand, as a fraction of screen
   * height (0–1). The sheet only expands as far as `contentHeight` (if
   * provided) actually needs — this is just a ceiling, so it never
   * expands past where the real content ends, which would otherwise leave
   * blank space and needlessly cover the map.
   */
  expandedHeight?: number;
  /** Fraction of screen height (0–1) visible when dragged all the way down (still shows a peek so it can be pulled back up). */
  collapsedHeight?: number;
  /**
   * The actual height (in px) of the scrollable content inside the sheet,
   * e.g. from a ScrollView's `onContentSizeChange`. When provided, the
   * "expanded" snap point stops exactly where this content ends instead
   * of always jumping to `expandedHeight` — eliminating blank space both
   * above the content (when dragged up) and below it.
   */
  contentHeight?: number;
  /** Background colour of the sheet (passed through from the screen's theme). */
  backgroundColor: string;
  /** Sheet content. */
  children: React.ReactNode;
  /** Extra style for the sheet container (e.g. paddingHorizontal). */
  style?: ViewStyle;
  /** Called whenever the sheet finishes settling on a snap point. */
  onSnap?: (point: SheetSnapPoint) => void;
}

/**
 * A Rapido-style bottom sheet the user can drag up to see full trip
 * details, or drag down to see more of the map — with no extra native
 * dependencies (built on the core Animated + PanResponder APIs already
 * shipped with React Native / react-native-gesture-handler).
 *
 * When the caller passes `contentHeight` (the real measured height of the
 * scrollable content, e.g. from a ScrollView's onContentSizeChange), the
 * sheet only ever expands as far as that content needs — dragging up
 * stops exactly where the content ends instead of revealing blank space,
 * and the map stays visible below that point.
 *
 * Always starts at its `default` resting position, same as the reference
 * screenshots (it never opens already-expanded or already-collapsed).
 */
export function DraggableSheet({
  defaultHeight = 0.42,
  expandedHeight = 0.88,
  collapsedHeight = 0.16,
  contentHeight,
  backgroundColor,
  children,
  style,
  onSnap,
}: DraggableSheetProps) {
  const collapsedY = SCREEN_HEIGHT * (1 - collapsedHeight);
  const defaultY = SCREEN_HEIGHT * (1 - defaultHeight);
  const capExpandedY = SCREEN_HEIGHT * (1 - expandedHeight);

  // The actual Y position used for "expanded" — capped by the prop ceiling,
  // but pulled in (a larger Y / shorter sheet) when the real content is
  // shorter than that ceiling. Also never expands past the default
  // position (a sheet can't "expand" to be smaller than where it rests).
  const naturalExpandedY = contentHeight != null
    ? SCREEN_HEIGHT - contentHeight - HANDLE_HEIGHT
    : capExpandedY;
  const expandedY = Math.min(Math.max(naturalExpandedY, capExpandedY), defaultY);

  // translateY of the sheet, measured from the default position (0 = default).
  const translateY = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);
  const [snapPoint, setSnapPoint] = useState<SheetSnapPoint>('default');
  // Tracks the sheet's current visible height live, so the content area
  // (and anything pinned to its bottom, like Confirm/Cancel) always
  // matches what's actually on screen — not an oversized fixed height.
  const visibleHeight = useRef(new Animated.Value(SCREEN_HEIGHT * defaultHeight)).current;

  const snapTo = (point: SheetSnapPoint, targetExpandedY: number = expandedY) => {
    const targetAbsoluteY = point === 'expanded' ? targetExpandedY : point === 'collapsed' ? collapsedY : defaultY;
    const targetOffset = targetAbsoluteY - defaultY;
    lastOffset.current = targetOffset;
    Animated.spring(translateY, {
      toValue: targetOffset,
      useNativeDriver: true,
      bounciness: 4,
      speed: 14,
    }).start();
    Animated.spring(visibleHeight, {
      toValue: SCREEN_HEIGHT - targetAbsoluteY,
      useNativeDriver: false,
      bounciness: 4,
      speed: 14,
    }).start();
    setSnapPoint(point);
    onSnap?.(point);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 4,
      onPanResponderGrant: () => {
        translateY.setOffset(lastOffset.current);
        translateY.setValue(0);
      },
      onPanResponderMove: (_, gesture) => {
        // Clamp so the sheet can't be dragged above where its content ends,
        // or below "collapsed" — no blank space in either direction.
        const proposedAbsoluteY = defaultY + lastOffset.current + gesture.dy;
        const clampedAbsoluteY = Math.min(Math.max(proposedAbsoluteY, expandedY), collapsedY);
        translateY.setValue(clampedAbsoluteY - defaultY - lastOffset.current);
        visibleHeight.setValue(SCREEN_HEIGHT - clampedAbsoluteY);
      },
      onPanResponderRelease: (_, gesture) => {
        translateY.flattenOffset();
        const currentOffset = lastOffset.current + gesture.dy;
        const currentAbsoluteY = defaultY + currentOffset;

        // Decide nearest snap point, with a velocity boost so a fast flick
        // in either direction snaps further even from a small drag distance.
        const velocityBoost = gesture.vy * 120;
        const projectedY = currentAbsoluteY + velocityBoost;

        const distances: { point: SheetSnapPoint; y: number }[] = [
          { point: 'expanded', y: expandedY },
          { point: 'default', y: defaultY },
          { point: 'collapsed', y: collapsedY },
        ];
        let nearest = distances[0];
        let nearestDist = Math.abs(projectedY - nearest.y);
        for (const d of distances) {
          const dist = Math.abs(projectedY - d.y);
          if (dist < nearestDist) {
            nearest = d;
            nearestDist = dist;
          }
        }
        snapTo(nearest.point);
      },
    })
  ).current;

  // Always start at the default resting position on mount.
  useEffect(() => {
    translateY.setValue(0);
    lastOffset.current = 0;
    visibleHeight.setValue(SCREEN_HEIGHT * defaultHeight);
    setSnapPoint('default');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If the sheet is currently expanded and the content height changes
  // (e.g. a dropdown inside opens/closes), keep it pinned to the content's
  // true end rather than leaving it at a stale position.
  const prevExpandedY = useRef(expandedY);
  useEffect(() => {
    if (snapPoint === 'expanded' && prevExpandedY.current !== expandedY) {
      snapTo('expanded', expandedY);
    }
    prevExpandedY.current = expandedY;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedY]);

  return (
    <Animated.View
      style={[
        styles.sheet,
        { backgroundColor, top: defaultY, height: SCREEN_HEIGHT - expandedY, transform: [{ translateY }] },
        style,
      ]}
    >
      <View {...panResponder.panHandlers} style={styles.handleArea}>
        <View style={styles.dragHandle} />
      </View>
      <Animated.View
        style={[styles.content, { height: Animated.subtract(visibleHeight, HANDLE_HEIGHT) }]}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -6 },
    elevation: 20,
  },
  handleArea: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  content: {
    overflow: 'hidden',
  },
});