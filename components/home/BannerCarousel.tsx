import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { BorderRadius, Layout, Spacing } from '../../theme/spacing';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  code?: string;
  gradient: [string, string, string];
  emoji: string;
  tag: string;
}

const BANNERS: Banner[] = [
  {
    id: 'b1',
    title: 'New User Offer',
    subtitle: '50% off on your first 3 rides',
    code: 'VAHAN50',
    gradient: ['#f8a305', '#f49b0d', '#FFB366'],
    emoji: '🎉',
    tag: 'LIMITED TIME',
  },
  {
    id: 'b2',
    title: 'Free Parcel Delivery',
    subtitle: 'On orders above ₹500 · Today only',
    code: 'FREESHIP',
    gradient: ['#f8b807', '#eac408', '#f1d12f'],
    emoji: '📦',
    tag: 'TODAY ONLY',
  },
  {
    id: 'b3',
    title: 'Safe Rides Guaranteed',
    subtitle: 'All drivers verified & insured',
    gradient: ['#f1a163', '#f5ac4e', '#f4b785'],
    emoji: '🛡️',
    tag: 'ALWAYS ON',
  },
];

interface BannerCarouselProps {
  onPress?: (banner: Banner) => void;
}

export function BannerCarousel({ onPress }: BannerCarouselProps) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ITEM_WIDTH = width - Layout.screenPadding * 2;

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % BANNERS.length;
        flatRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleScroll = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / ITEM_WIDTH);
    setActiveIndex(index);
  };

  return (
    <View style={styles.wrapper}>
      <FlatList
        ref={flatRef}
        data={BANNERS}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={handleScroll}
        snapToInterval={ITEM_WIDTH + Spacing.sm}
        decelerationRate="fast"
        contentContainerStyle={{ gap: Spacing.sm, paddingHorizontal: Layout.screenPadding }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onPress?.(item)}
            activeOpacity={0.9}
            accessibilityLabel={item.title}
            accessibilityRole="button"
            style={{ width: ITEM_WIDTH }}
          >
            <LinearGradient
              colors={item.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.banner}
            >
              {/* Decorative circles */}
              <View style={styles.decorCircleA} />
              <View style={styles.decorCircleB} />

              <View style={styles.bannerContent}>
                <View style={styles.textArea}>
                  <View style={styles.tagPill}>
                    <Text style={styles.bannerTag}>{item.tag}</Text>
                  </View>
                  <Text style={styles.bannerTitle}>{item.title}</Text>
                  <Text style={styles.bannerSub}>{item.subtitle}</Text>
                  {item.code && (
                    <View style={styles.codePill}>
                      <Text style={styles.codeText}>{item.code}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.emoji}>{item.emoji}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
      />

      {/* Dot indicators */}
      <View style={styles.dots}>
        {BANNERS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === activeIndex
                ? { backgroundColor: Colors.primary, width: 22 }
                : { backgroundColor: Colors.primary + '30', width: 7 },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },

  banner: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    height: 120,
    justifyContent: 'center',
    overflow: 'hidden',

    shadowColor: '#FF6B00',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  decorCircleA: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
    right: -30,
    top: -30,
  },

  decorCircleB: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.06)',
    right: 40,
    bottom: -15,
  },

  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  textArea: {
    flex: 1,
    gap: 2,
    paddingRight: 10,
  },

  tagPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginBottom: 2,
  },

  bannerTag: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 1,
  },

  bannerTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '800',
  },

  bannerSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 15,
  },

  codePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 4,
  },

  codeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  emoji: {
    fontSize: 42,
    marginLeft: 8,
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },

  dot: {
    height: 6,
    borderRadius: 10,
  },
});
