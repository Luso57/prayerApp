import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";

const REVIEW_PRAYER_COUNT_KEY = "@review_prayer_count";
const REVIEW_LAST_PROMPT_KEY = "@review_last_prompt";

const MIN_PRAYER_COUNT = 4;
const MIN_DAYS_BETWEEN_PROMPTS = 4;

const daysBetween = (from: Date, to: Date): number => {
  const diffMs = to.getTime() - from.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

export async function maybeRequestReview(): Promise<void> {
  try {
    const [countStr, lastPromptStr] = await Promise.all([
      AsyncStorage.getItem(REVIEW_PRAYER_COUNT_KEY),
      AsyncStorage.getItem(REVIEW_LAST_PROMPT_KEY),
    ]);

    const count = countStr ? parseInt(countStr, 10) : 0;
    const nextCount = count + 1;
    await AsyncStorage.setItem(REVIEW_PRAYER_COUNT_KEY, nextCount.toString());

    if (nextCount < MIN_PRAYER_COUNT) return;

    if (lastPromptStr) {
      const lastPromptDate = new Date(lastPromptStr);
      if (daysBetween(lastPromptDate, new Date()) < MIN_DAYS_BETWEEN_PROMPTS) {
        return;
      }
    }

    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) return;

    await StoreReview.requestReview();
    await AsyncStorage.setItem(
      REVIEW_LAST_PROMPT_KEY,
      new Date().toISOString(),
    );
  } catch (error) {
    console.log("Review prompt error:", error);
  }
}
