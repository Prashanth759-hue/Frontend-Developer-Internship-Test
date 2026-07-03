/**
 * Vahan360 — useTheme hook
 *
 * Re-exports the context hook and adds a handful of
 * derived helpers so components stay clean.
 */
import { useTheme as _useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';

export { _useTheme as useTheme };

/**
 * Convenience hook — returns just the resolved color map.
 * Use when you only need colors and not mode/setMode.
 */
export function useColors() {
  return _useTheme().colors;
}

/**
 * Returns a single color value from the resolved theme colors,
 * type-safely.
 *
 * Usage:
 *   const bg = useColor('background');
 */
export function useColor(key: keyof ReturnType<typeof _useTheme>['colors']): string {
  const { colors } = _useTheme();
  return colors[key];
}

export default _useTheme;