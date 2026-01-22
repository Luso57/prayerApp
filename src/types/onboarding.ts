// Types for the onboarding survey flow

export interface OnboardingData {
  name: string;
  age: AgeOption | null;
  prayerLife: PrayerLifeOption | null;
  prayerStruggles: PrayerStruggleOption[];
  prayerStyle: PrayerStyleOption | null;
}

export type PrayerLifeOption =
  | 'starting'
  | 'occasionally'
  | 'regular'
  | 'central'
  | 'struggling';

export type AgeOption =
  | '18-24'
  | '25-34'
  | '35-44'
  | '45-54'
  | '55+';

export type PrayerStruggleOption =
  | 'focus'
  | 'what_to_pray'
  | 'god_listening'
  | 'habit'
  | 'awkward';

export type PrayerStyleOption =
  | 'daily_devotion'
  | 'mindful_moments'
  | 'scheduled';

// Option display data
export interface SelectOption<T> {
  id: T;
  emoji: string;
  title: string;
  subtitle: string;
}

// Prayer Life Options
export const prayerLifeOptions: SelectOption<PrayerLifeOption>[] = [
  {
    id: 'starting',
    emoji: '🕊️',
    title: 'Brand new to prayer',
    subtitle: 'Ready to begin this beautiful journey',
  },
  {
    id: 'occasionally',
    emoji: '🙏',
    title: 'I pray now and then',
    subtitle: 'When life calls me to pause',
  },
  {
    id: 'regular',
    emoji: '☀️',
    title: 'Prayer is part of my routine',
    subtitle: 'Growing closer each day',
  },
  {
    id: 'central',
    emoji: '💛',
    title: 'I pray throughout my day',
    subtitle: 'Walking in constant conversation with God',
  },
  {
    id: 'struggling',
    emoji: '🤍',
    title: 'Finding it hard lately',
    subtitle: 'Looking for a fresh start',
  },
];

// Age Options
export interface AgeSelectOption {
  id: AgeOption;
  title: string;
}

export const ageOptions: AgeSelectOption[] = [
  { id: '18-24', title: '18-24' },
  { id: '25-34', title: '25-34' },
  { id: '35-44', title: '35-44' },
  { id: '45-54', title: '45-54' },
  { id: '55+', title: '55+' },
];

// Prayer Struggle Options
export const prayerStruggleOptions: SelectOption<PrayerStruggleOption>[] = [
  {
    id: 'focus',
    emoji: '🧠',
    title: 'My mind keeps wandering',
    subtitle: 'Hard to stay present in the moment',
  },
  {
    id: 'what_to_pray',
    emoji: '💬',
    title: "I don't know what to say",
    subtitle: 'Words dont come easily',
  },
  {
    id: 'god_listening',
    emoji: '👂',
    title: 'Does God hear me?',
    subtitle: 'Wondering if my prayers reach heaven',
  },
  {
    id: 'habit',
    emoji: '📅',
    title: 'Being consistent is tough',
    subtitle: 'I struggle to pray regularly',
  },
  {
    id: 'awkward',
    emoji: '😅',
    title: 'It feels unnatural',
    subtitle: 'Prayer doesnt come naturally to me yet',
  },
];

// Prayer Style Options
export const prayerStyleOptions: SelectOption<PrayerStyleOption>[] = [
  {
    id: 'daily_devotion',
    emoji: '🌅',
    title: 'Once a Day',
    subtitle: 'Start each morning with a moment of prayer',
  },
  {
    id: 'mindful_moments',
    emoji: '✨',
    title: 'A Few Times a Day',
    subtitle: 'Pause throughout the day to connect with God',
  },
  {
    id: 'scheduled',
    emoji: '🔥',
    title: 'As Often as Possible',
    subtitle: 'Make prayer a constant part of my routine',
  },
];

// Initial state for onboarding
export const initialOnboardingData: OnboardingData = {
  name: '',
  age: null,
  prayerLife: null,
  prayerStruggles: [],
  prayerStyle: null,
};