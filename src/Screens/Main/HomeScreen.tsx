import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Animated,
} from 'react-native';
import { colors, typography, spacing } from '../../constants/theme';
import PrayerStreakCard from './components/PrayerStreakCard';
import VerseOfDayCard from './components/VerseOfDayCard';
import PrayerCard, { Prayer } from './components/PrayerCard';
import StreakService from '../../Services/StreakService';
import VerseService from '../../Services/VerseService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_NAME_KEY = '@user_name';

// Sample prayers data - replace with actual data from storage/API
const samplePrayers: Prayer[] = [
  {
    id: '1',
    title: 'Morning Gratitude',
    content: 'Thank you Lord for this new day and all the blessings you have given me...',
    date: new Date(),
    category: 'Gratitude',
  },
  {
    id: '2',
    title: 'Prayer for Family',
    content: 'Lord, please watch over my family and keep them safe and healthy...',
    date: new Date(Date.now() - 86400000), // Yesterday
    category: 'Family',
  },
  {
    id: '3',
    title: 'Guidance for Work',
    content: 'Father, give me wisdom and clarity as I face challenges at work today...',
    date: new Date(Date.now() - 86400000 * 3), // 3 days ago
    category: 'Guidance',
  },
];

interface HomeScreenProps {
  userName?: string;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ userName = 'Friend' }) => {
  const [streak, setStreak] = useState(0);
  const [verse, setVerse] = useState({ verse: '', reference: '' });
  const [displayName, setDisplayName] = useState(userName);
  const bounceAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Load streak, verse, and user name on mount
    const loadData = async () => {
      const currentStreak = await StreakService.getAndUpdateStreak();
      setStreak(currentStreak);
      
      const dailyVerse = await VerseService.getVerseOfDay();
      setVerse(dailyVerse);

      // Load saved user name
      const savedName = await AsyncStorage.getItem(USER_NAME_KEY);
      if (savedName) {
        setDisplayName(savedName);
      }
    };
    loadData();

    Animated.parallel([
      Animated.spring(bounceAnim, {
        toValue: 0,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.userName}>{displayName} 👋</Text>
          <Animated.Image
            source={require('../../../assets/DoveHeadTitleLeft.png')}
            style={[
              styles.doveImage,
              {
                opacity: opacityAnim,
                transform: [{ translateY: bounceAnim }],
              },
            ]}
            resizeMode="contain"
          />
        </View>

        {/* Prayer Streak Card */}
        <PrayerStreakCard streak={streak} />

        {/* Daily Verse Card */}
        <VerseOfDayCard
          verse={verse.verse}
          reference={verse.reference}
        />

        {/* Prayers Section */}
        <View style={styles.prayersSection}>
          <Text style={styles.sectionTitle}>Prayers</Text>
          {samplePrayers.map((prayer) => (
            <PrayerCard key={prayer.id} prayer={prayer} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.cream,
  },

  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },

  header: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },

  doveImage: {
    position: 'absolute',
    top: 0,
    right: -spacing.md,
    width: 150,
    height: 110,
  },

  greeting: {
    fontSize: typography.size.lg,
    color: colors.text.secondary,
  },

  userName: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },

  prayersSection: {
    marginTop: spacing.sm,
    paddingBottom: spacing.xl,
  },

  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
});

export default HomeScreen;
