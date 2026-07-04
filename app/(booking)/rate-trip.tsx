import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ImageBackground, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Star, ThumbsUp } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { useBookingStore } from '../../store/bookingStore';
import { Button } from '../../components/common/Button';
import { MOCK_DRIVERS } from '../../constants/mockData';

const DRIVER = MOCK_DRIVERS[0];

const QUICK_TAGS = [
  'Clean vehicle', 'Polite driver', 'On time', 'Safe driving',
  'Friendly', 'Good route',
];

export default function RateTripScreen() {
  const { colors } = useTheme();
  const { resetBooking } = useBookingStore();
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Please rate your trip', 'Tap the stars to leave a rating.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      resetBooking();
      router.replace('/(main)/home');
    }, 1000);
  };

  const handleSkip = () => {
    resetBooking();
    router.replace('/(main)/home');
  };

  return (
    <ImageBackground
      source={require('../../assets/images/home-bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        {/* Hero */}
        <View style={styles.heroHeader}>
          <View style={styles.successCircle}>
            <ThumbsUp size={32} color="#FFF" />
          </View>
          <Text style={styles.heroTitle}>Trip Completed!</Text>
          <Text style={styles.heroSubtitle}>How was your experience with {DRIVER.name}?</Text>
        </View>

        <View style={styles.content}>
          {/* Stars */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>⭐ RATE YOUR TRIP</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                  <Star
                    size={44}
                    color={Colors.primary}
                    fill={star <= rating ? Colors.primary : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingLabel}>
              {rating === 0 ? 'Tap to rate' : rating === 5 ? 'Excellent!' : rating === 4 ? 'Great!' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
            </Text>
          </View>

          {/* Quick tags */}
          {rating >= 4 && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>👍 WHAT WENT WELL?</Text>
              <View style={styles.tagsWrap}>
                {QUICK_TAGS.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.tag, selectedTags.includes(tag) && styles.tagActive]}
                    onPress={() => toggleTag(tag)}
                  >
                    <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextActive]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Feedback */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>💬 ADDITIONAL FEEDBACK (OPTIONAL)</Text>
            <TextInput
              style={[styles.feedbackInput, { color: colors.textPrimary }]}
              value={feedback}
              onChangeText={setFeedback}
              placeholder="Tell us more about your experience..."
              placeholderTextColor={colors.placeholder ?? '#9CA3AF'}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
          </View>

          <Button
            label="Submit Rating"
            onPress={handleSubmit}
            loading={submitting}
            style={styles.submitBtn}
          />

          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },

  heroHeader: {
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 28,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.18)', marginBottom: 16,
    alignItems: 'center', gap: 10,
  },
  successCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#FF6B00',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#FF6B00', shadowOpacity: 0.3, shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#FF6B00', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 14, color: '#555', fontWeight: '500', textAlign: 'center' },

  content: { flex: 1, paddingHorizontal: 16, paddingBottom: 24, gap: 14 },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: '#FFE8D6',
    shadowColor: '#FF6B00', shadowOpacity: 0.08, shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 }, elevation: 6, gap: 12,
  },
  cardLabel: { fontSize: 10, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1.2 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  ratingLabel: { textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#FF6B00' },

  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#E0E0E0',
  },
  tagActive: { backgroundColor: '#FFF0E6', borderColor: Colors.primary },
  tagText: { fontSize: 13, fontWeight: '600', color: '#555' },
  tagTextActive: { color: Colors.primary },

  feedbackInput: {
    borderWidth: 1, borderColor: '#FFE8D6', borderRadius: 16,
    padding: 12, minHeight: 80, fontSize: 14, lineHeight: 20,
    textAlignVertical: 'top',
  },

  submitBtn: { width: '100%' },
  skipBtn: { alignItems: 'center', paddingVertical: 10 },
  skipText: { fontSize: 14, fontWeight: '600', color: '#9CA3AF' },
});
