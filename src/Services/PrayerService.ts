import prayersData from "../../assets/prayers/prayers.json";

export interface Prayer {
  id: string;
  categoryId: string;
  title: string;
  text: string;
}

export interface PrayerCategory {
  id: string;
  label: string;
}

class PrayerService {
  private prayers: Prayer[];
  private categories: PrayerCategory[];

  constructor() {
    this.prayers = prayersData.prayers;
    this.categories = prayersData.categories;
  }

  getAllCategories(): PrayerCategory[] {
    return this.categories;
  }

  getPrayersByCategory(categoryId: string): Prayer[] {
    return this.prayers.filter((prayer) => prayer.categoryId === categoryId);
  }

  getRandomPrayerByCategory(categoryId: string): Prayer | null {
    const categoryPrayers = this.getPrayersByCategory(categoryId);
    if (categoryPrayers.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * categoryPrayers.length);
    return categoryPrayers[randomIndex];
  }

  getRandomPrayer(): Prayer {
    const randomIndex = Math.floor(Math.random() * this.prayers.length);
    return this.prayers[randomIndex];
  }
}

export default new PrayerService();
