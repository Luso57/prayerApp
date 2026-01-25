//
//  VerseManager.swift
//  PrayerFirstApp
//
//  Shared manager for daily Bible verses across app and widgets
//  Uses App Group for shared storage
//

import Foundation

struct DailyVerse: Codable {
    let text: String
    let reference: String
    let date: String // YYYY-MM-DD format
}

/// Shared manager for storing and retrieving daily verses
/// Used by both the main app and the widget extension
class VerseManager {
    static let shared = VerseManager()
    
    private let appGroupID = "group.com.prayerlock.shared"
    private let verseKey = "dailyVerse"
    
    private var userDefaults: UserDefaults? {
        UserDefaults(suiteName: appGroupID)
    }
    
    // Curated list of verses (same as in React Native)
    private let verses: [(ref: String, text: String)] = [
        ("Psalm 46:10", "Be still, and know that I am God."),
        ("Psalm 23:1", "The Lord is my shepherd; I shall not want."),
        ("Psalm 34:8", "O taste and see that the Lord is good: blessed is the man that trusteth in him."),
        ("Psalm 37:5", "Commit thy way unto the Lord; trust also in him; and he shall bring it to pass."),
        ("Psalm 55:22", "Cast thy burden upon the Lord, and he shall sustain thee."),
        ("Psalm 56:3", "What time I am afraid, I will trust in thee."),
        ("Psalm 62:8", "Trust in him at all times; ye people, pour out your heart before him."),
        ("Psalm 91:1", "He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty."),
        ("Psalm 118:24", "This is the day which the Lord hath made; we will rejoice and be glad in it."),
        ("Psalm 121:7", "The Lord shall preserve thee from all evil: he shall preserve thy soul."),
        ("Proverbs 3:5", "Trust in the Lord with all thine heart; and lean not unto thine own understanding."),
        ("Proverbs 3:6", "In all thy ways acknowledge him, and he shall direct thy paths."),
        ("Proverbs 4:23", "Keep thy heart with all diligence; for out of it are the issues of life."),
        ("Proverbs 16:3", "Commit thy works unto the Lord, and thy thoughts shall be established."),
        ("Isaiah 26:3", "Thou wilt keep him in perfect peace, whose mind is stayed on thee."),
        ("Isaiah 40:31", "They that wait upon the Lord shall renew their strength."),
        ("Isaiah 41:10", "Fear thou not; for I am with thee: be not dismayed; for I am thy God."),
        ("Isaiah 43:2", "When thou passest through the waters, I will be with thee."),
        ("Jeremiah 29:11", "For I know the thoughts that I think toward you, saith the Lord, thoughts of peace, and not of evil."),
        ("Lamentations 3:22", "It is of the Lord's mercies that we are not consumed."),
        ("Lamentations 3:23", "They are new every morning: great is thy faithfulness."),
        ("Matthew 6:33", "But seek ye first the kingdom of God, and his righteousness."),
        ("Matthew 11:28", "Come unto me, all ye that labour and are heavy laden, and I will give you rest."),
        ("Matthew 19:26", "With God all things are possible."),
        ("John 1:5", "And the light shineth in darkness; and the darkness comprehended it not."),
        ("John 8:12", "I am the light of the world: he that followeth me shall not walk in darkness."),
        ("John 14:6", "I am the way, the truth, and the life."),
        ("John 14:27", "Peace I leave with you, my peace I give unto you."),
        ("Romans 8:1", "There is therefore now no condemnation to them which are in Christ Jesus."),
        ("Romans 8:28", "And we know that all things work together for good to them that love God."),
        ("Romans 12:12", "Rejoicing in hope; patient in tribulation; continuing instant in prayer."),
        ("1 Corinthians 16:14", "Let all your things be done with charity."),
        ("2 Corinthians 5:7", "For we walk by faith, not by sight."),
        ("2 Corinthians 12:9", "My grace is sufficient for thee: for my strength is made perfect in weakness."),
        ("Galatians 2:20", "I live; yet not I, but Christ liveth in me."),
        ("Galatians 5:22", "But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith."),
        ("Ephesians 6:10", "Be strong in the Lord, and in the power of his might."),
        ("Philippians 1:6", "He which hath begun a good work in you will perform it."),
        ("Philippians 4:6", "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God."),
        ("Philippians 4:7", "And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus."),
        ("Philippians 4:13", "I can do all things through Christ which strengtheneth me."),
        ("Colossians 3:23", "And whatsoever ye do, do it heartily, as to the Lord."),
        ("1 Thessalonians 5:16", "Rejoice evermore."),
        ("1 Thessalonians 5:17", "Pray without ceasing."),
        ("1 Thessalonians 5:18", "In every thing give thanks."),
        ("2 Timothy 1:7", "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind."),
        ("Hebrews 11:1", "Now faith is the substance of things hoped for, the evidence of things not seen."),
        ("Hebrews 13:5", "I will never leave thee, nor forsake thee."),
        ("James 1:5", "If any of you lack wisdom, let him ask of God."),
        ("James 4:8", "Draw nigh to God, and he will draw nigh to you."),
        ("1 Peter 5:7", "Casting all your care upon him; for he careth for you."),
        ("1 John 4:18", "There is no fear in love; but perfect love casteth out fear."),
        ("Revelation 21:4", "And God shall wipe away all tears from their eyes.")
    ]
    
    /// Get the daily verse index based on the date (same algorithm as React Native)
    private func getDailyVerseIndex() -> Int {
        let calendar = Calendar.current
        let today = Date()
        let year = calendar.component(.year, from: today)
        let dayOfYear = calendar.ordinality(of: .day, in: .year, for: today) ?? 1
        let seed = year * 1000 + dayOfYear
        return seed % verses.count
    }
    
    /// Get today's date string in YYYY-MM-DD format
    private func getTodayString() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: Date())
    }
    
    /// Get the daily verse (from cache or generate new one)
    func getDailyVerse() -> DailyVerse {
        let todayString = getTodayString()
        
        // Try to load cached verse
        if let cached = loadCachedVerse(), cached.date == todayString {
            return cached
        }
        
        // Generate new verse for today
        let index = getDailyVerseIndex()
        let selected = verses[index]
        let verse = DailyVerse(text: selected.text, reference: selected.ref, date: todayString)
        
        // Cache it
        saveCachedVerse(verse)
        
        return verse
    }
    
    /// Save verse from React Native side
    func saveVerse(text: String, reference: String) {
        let verse = DailyVerse(text: text, reference: reference, date: getTodayString())
        saveCachedVerse(verse)
    }
    
    private func saveCachedVerse(_ verse: DailyVerse) {
        guard let defaults = userDefaults else {
            print("[VerseManager] ❌ Could not access App Group UserDefaults")
            return
        }
        
        do {
            let data = try JSONEncoder().encode(verse)
            defaults.set(data, forKey: verseKey)
            defaults.synchronize()
            print("[VerseManager] ✅ Saved verse: \(verse.reference)")
        } catch {
            print("[VerseManager] ❌ Failed to save verse: \(error)")
        }
    }
    
    private func loadCachedVerse() -> DailyVerse? {
        guard let defaults = userDefaults,
              let data = defaults.data(forKey: verseKey) else {
            return nil
        }
        
        do {
            return try JSONDecoder().decode(DailyVerse.self, from: data)
        } catch {
            print("[VerseManager] ❌ Failed to decode verse: \(error)")
            return nil
        }
    }
}
