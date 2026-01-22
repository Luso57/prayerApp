import AsyncStorage from '@react-native-async-storage/async-storage';
import versesData from '../../assets/bible/verses.json';

const VERSE_KEY = '@verse_of_day';
const VERSE_DATE_KEY = '@verse_date';

// Type definitions for the Bible JSON structure
interface BibleVerse {
  verse: number;
  text: string;
}

interface BibleChapter {
  chapter: number;
  verses: BibleVerse[];
}

interface BibleBook {
  name: string;
  chapters: BibleChapter[];
}

interface BibleData {
  translation: string;
  books: BibleBook[];
}

interface StoredVerse {
  verse: string;
  reference: string;
}

// Curated list of inspirational verses (book, chapter, verse)
// These are popular verses that work well for daily encouragement
const CURATED_VERSES = [
  { book: 'Psalms', chapter: 23, verse: 1 },
  { book: 'Psalms', chapter: 46, verse: 10 },
  { book: 'Psalms', chapter: 27, verse: 1 },
  { book: 'Psalms', chapter: 34, verse: 8 },
  { book: 'Psalms', chapter: 37, verse: 4 },
  { book: 'Psalms', chapter: 91, verse: 1 },
  { book: 'Psalms', chapter: 118, verse: 24 },
  { book: 'Psalms', chapter: 119, verse: 105 },
  { book: 'Psalms', chapter: 121, verse: 1 },
  { book: 'Psalms', chapter: 139, verse: 14 },
  { book: 'Proverbs', chapter: 3, verse: 5 },
  { book: 'Proverbs', chapter: 3, verse: 6 },
  { book: 'Proverbs', chapter: 16, verse: 3 },
  { book: 'Proverbs', chapter: 18, verse: 10 },
  { book: 'Isaiah', chapter: 40, verse: 31 },
  { book: 'Isaiah', chapter: 41, verse: 10 },
  { book: 'Isaiah', chapter: 43, verse: 2 },
  { book: 'Jeremiah', chapter: 29, verse: 11 },
  { book: 'Lamentations', chapter: 3, verse: 22 },
  { book: 'Matthew', chapter: 5, verse: 14 },
  { book: 'Matthew', chapter: 6, verse: 33 },
  { book: 'Matthew', chapter: 11, verse: 28 },
  { book: 'Matthew', chapter: 28, verse: 20 },
  { book: 'John', chapter: 3, verse: 16 },
  { book: 'John', chapter: 14, verse: 6 },
  { book: 'John', chapter: 14, verse: 27 },
  { book: 'John', chapter: 16, verse: 33 },
  { book: 'Romans', chapter: 8, verse: 28 },
  { book: 'Romans', chapter: 8, verse: 38 },
  { book: 'Romans', chapter: 12, verse: 2 },
  { book: '1 Corinthians', chapter: 10, verse: 13 },
  { book: '1 Corinthians', chapter: 13, verse: 4 },
  { book: '2 Corinthians', chapter: 5, verse: 17 },
  { book: '2 Corinthians', chapter: 12, verse: 9 },
  { book: 'Galatians', chapter: 5, verse: 22 },
  { book: 'Ephesians', chapter: 2, verse: 8 },
  { book: 'Ephesians', chapter: 3, verse: 20 },
  { book: 'Philippians', chapter: 4, verse: 6 },
  { book: 'Philippians', chapter: 4, verse: 13 },
  { book: 'Philippians', chapter: 4, verse: 19 },
  { book: 'Colossians', chapter: 3, verse: 23 },
  { book: '2 Timothy', chapter: 1, verse: 7 },
  { book: 'Hebrews', chapter: 11, verse: 1 },
  { book: 'Hebrews', chapter: 12, verse: 2 },
  { book: 'Hebrews', chapter: 13, verse: 5 },
  { book: 'James', chapter: 1, verse: 5 },
  { book: '1 Peter', chapter: 5, verse: 7 },
  { book: '1 John', chapter: 4, verse: 4 },
  { book: '1 John', chapter: 4, verse: 19 },
  { book: 'Revelation', chapter: 21, verse: 4 },
];

const getVerseFromBible = (bookName: string, chapterNum: number, verseNum: number): StoredVerse | null => {
  try {
    const bible = versesData as BibleData;
    const book = bible.books.find((b) => b.name === bookName);
    if (!book) return null;

    const chapter = book.chapters.find((c) => c.chapter === chapterNum);
    if (!chapter) return null;

    const verse = chapter.verses.find((v) => v.verse === verseNum);
    if (!verse) return null;

    return {
      verse: verse.text.trim(),
      reference: `${bookName} ${chapterNum}:${verseNum}`,
    };
  } catch (error) {
    console.error('Error getting verse from Bible:', error);
    return null;
  }
};

const getRandomCuratedVerse = (): StoredVerse => {
  const randomIndex = Math.floor(Math.random() * CURATED_VERSES.length);
  const selected = CURATED_VERSES[randomIndex];
  
  const verse = getVerseFromBible(selected.book, selected.chapter, selected.verse);
  
  if (verse) {
    return verse;
  }
  
  // Fallback verse
  return {
    verse: 'Be still, and know that I am God.',
    reference: 'Psalm 46:10',
  };
};

export const VerseService = {
  async getVerseOfDay(): Promise<StoredVerse> {
    try {
      const storedDate = await AsyncStorage.getItem(VERSE_DATE_KEY);
      const storedVerse = await AsyncStorage.getItem(VERSE_KEY);
      
      const today = new Date().toDateString();
      
      // If we have a verse from today, return it
      if (storedDate === today && storedVerse) {
        return JSON.parse(storedVerse);
      }
      
      // Get a new random verse
      const newVerse = getRandomCuratedVerse();
      
      // Save it
      await AsyncStorage.setItem(VERSE_DATE_KEY, today);
      await AsyncStorage.setItem(VERSE_KEY, JSON.stringify(newVerse));
      
      return newVerse;
    } catch (error) {
      console.error('Error getting verse of day:', error);
      return {
        verse: 'Be still, and know that I am God.',
        reference: 'Psalm 46:10',
      };
    }
  },
  
  // Force get a new verse (for testing)
  async getNewVerse(): Promise<StoredVerse> {
    const newVerse = getRandomCuratedVerse();
    const today = new Date().toDateString();
    
    await AsyncStorage.setItem(VERSE_DATE_KEY, today);
    await AsyncStorage.setItem(VERSE_KEY, JSON.stringify(newVerse));
    
    return newVerse;
  },
};

export default VerseService;
