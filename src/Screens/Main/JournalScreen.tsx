import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { typography, spacing } from "../../constants/theme";
import { useTheme } from "../../contexts/ThemeContext";
import JournalService, {
  JournalEntry,
  MOODS,
  FilterOptions,
} from "../../Services/JournalService";
import JournalEntryModal from "../../Components/JournalEntryModal";

const JournalScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<
    string | undefined
  >();
  const [showFilters, setShowFilters] = useState(false);

  const filters: FilterOptions | undefined = selectedMoodFilter
    ? { mood: selectedMoodFilter }
    : undefined;

  const loadEntries = useCallback(
    async (page: number = 0, append: boolean = false) => {
      await JournalService.loadEntries();
      const paginatedEntries = JournalService.getPaginatedEntries(
        page,
        filters,
      );
      const totalPages = JournalService.getTotalPages(filters);

      if (append) {
        setEntries((prev) => [...prev, ...paginatedEntries]);
      } else {
        setEntries(paginatedEntries);
      }

      setHasMore(page < totalPages - 1);
      setCurrentPage(page);
    },
    [filters],
  );

  useEffect(() => {
    loadEntries(0, false);
  }, [selectedMoodFilter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEntries(0, false);
    setRefreshing(false);
  }, [loadEntries]);

  const loadMore = useCallback(() => {
    if (hasMore && !refreshing) {
      loadEntries(currentPage + 1, true);
    }
  }, [hasMore, refreshing, currentPage, loadEntries]);

  const handleSaveEntry = () => {
    setIsModalVisible(false);
    loadEntries(0, false);
  };

  const handleDeleteEntry = useCallback(
    (id: string) => {
      Alert.alert(
        "Delete Entry",
        "Are you sure you want to delete this journal entry?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              await JournalService.deleteEntry(id);
              loadEntries(0, false);
            },
          },
        ],
      );
    },
    [loadEntries],
  );

  const handleClearOldEntries = useCallback(() => {
    Alert.alert(
      "Clear Old Entries",
      "Delete all entries older than 6 months?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const deletedCount = await JournalService.deleteOldEntries(6);
            Alert.alert("Success", `Deleted ${deletedCount} old entries`);
            loadEntries(0, false);
          },
        },
      ],
    );
  }, [loadEntries]);

  const renderEntry = ({ item }: { item: JournalEntry }) => (
    <View style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryMoodEmoji}>{item.moodEmoji}</Text>
        <View style={styles.entryMeta}>
          <Text style={styles.entryMood}>{item.mood}</Text>
          <Text style={styles.entryDateTime}>
            {item.date} • {item.time}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteEntry(item.id)}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.entryContent} numberOfLines={4}>
        {item.content}
      </Text>
      {item.prayerCategory && (
        <View style={styles.prayerTag}>
          <Text style={styles.prayerTagText}>🙏 {item.prayerCategory}</Text>
        </View>
      )}
    </View>
  );

  const ListHeader = () => (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Journal</Text>
        <Text style={styles.subtitle}>
          Capture your thoughts, prayers, and reflections
        </Text>
      </View>

      {/* Filter Section */}
      <View style={styles.filterSection}>
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterToggleText}>
            {selectedMoodFilter
              ? `Filter: ${selectedMoodFilter}`
              : "Filter by mood"}
          </Text>
          <Text style={styles.filterToggleIcon}>{showFilters ? "▼" : "▶"}</Text>
        </TouchableOpacity>

        {showFilters && (
          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                !selectedMoodFilter && styles.filterChipActive,
              ]}
              onPress={() => setSelectedMoodFilter(undefined)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  !selectedMoodFilter && styles.filterChipTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {MOODS.map((mood) => (
              <TouchableOpacity
                key={mood.id}
                style={[
                  styles.filterChip,
                  selectedMoodFilter === mood.label && styles.filterChipActive,
                ]}
                onPress={() => setSelectedMoodFilter(mood.label)}
              >
                <Text style={styles.filterChipEmoji}>{mood.emoji}</Text>
                <Text
                  style={[
                    styles.filterChipText,
                    selectedMoodFilter === mood.label &&
                      styles.filterChipTextActive,
                  ]}
                >
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.clearOldButton}
          onPress={handleClearOldEntries}
        >
          <Text style={styles.clearOldButtonText}>
            🗑️ Clear entries older than 6 months
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const ListEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📓</Text>
      <Text style={styles.emptyTitle}>No entries yet</Text>
      <Text style={styles.emptyText}>
        Start documenting your spiritual journey. Your journal entries will
        appear here.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          hasMore ? (
            <View style={styles.loadingFooter}>
              <Text style={styles.loadingText}>Loading more...</Text>
            </View>
          ) : null
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Journal Entry Modal */}
      <JournalEntryModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveEntry}
      />
    </SafeAreaView>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.cream,
    },

    scrollView: {
      flex: 1,
    },

    contentContainer: {
      padding: spacing.lg,
      paddingBottom: spacing.xl * 4,
    },

    filterSection: {
      marginBottom: spacing.lg,
    },

    filterToggle: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.ui.white,
      padding: spacing.md,
      borderRadius: 12,
      marginBottom: spacing.sm,
    },

    filterToggleText: {
      fontSize: typography.size.base,
      color: colors.text.primary,
      fontWeight: typography.weight.medium,
    },

    filterToggleIcon: {
      fontSize: typography.size.sm,
      color: colors.text.muted,
    },

    filterOptions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },

    filterChip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.ui.white,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.background.peach,
      gap: spacing.xs,
    },

    filterChipActive: {
      backgroundColor: colors.primary.main,
      borderColor: colors.primary.main,
    },

    filterChipEmoji: {
      fontSize: typography.size.base,
    },

    filterChipText: {
      fontSize: typography.size.sm,
      color: colors.text.primary,
    },

    filterChipTextActive: {
      color: colors.ui.white,
    },

    clearOldButton: {
      backgroundColor: colors.ui.white,
      padding: spacing.md,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.background.peach,
    },

    clearOldButtonText: {
      fontSize: typography.size.sm,
      color: colors.text.secondary,
      textAlign: "center",
    },

    loadingFooter: {
      padding: spacing.lg,
      alignItems: "center",
    },

    loadingText: {
      fontSize: typography.size.sm,
      color: colors.text.muted,
    },

    header: {
      marginBottom: spacing.xl,
    },

    title: {
      fontSize: typography.size["3xl"],
      fontWeight: typography.weight.bold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },

    subtitle: {
      fontSize: typography.size.base,
      color: colors.text.secondary,
      lineHeight: 22,
    },

    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.xl * 2,
      paddingHorizontal: spacing.xl,
    },

    emptyIcon: {
      fontSize: 64,
      marginBottom: spacing.lg,
    },

    emptyTitle: {
      fontSize: typography.size.xl,
      fontWeight: typography.weight.semibold,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    },

    emptyText: {
      fontSize: typography.size.base,
      color: colors.text.secondary,
      textAlign: "center",
      lineHeight: 22,
    },

    entryCard: {
      marginBottom: spacing.md,
      backgroundColor: colors.ui.white,
      borderRadius: 16,
      padding: spacing.lg,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },

    entryHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.md,
    },

    deleteButton: {
      padding: spacing.sm,
      marginLeft: spacing.sm,
    },

    deleteButtonText: {
      fontSize: typography.size.lg,
      color: colors.text.muted,
    },

    entryMoodEmoji: {
      fontSize: 32,
      marginRight: spacing.md,
    },

    entryMeta: {
      flex: 1,
    },

    entryMood: {
      fontSize: typography.size.base,
      fontWeight: typography.weight.semibold,
      color: colors.text.primary,
    },

    entryDateTime: {
      fontSize: typography.size.sm,
      color: colors.text.muted,
      marginTop: 2,
    },

    entryContent: {
      fontSize: typography.size.base,
      color: colors.text.secondary,
      lineHeight: 22,
    },

    prayerTag: {
      backgroundColor: colors.primary.soft,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: 8,
      alignSelf: "flex-start",
      marginTop: spacing.md,
    },

    prayerTagText: {
      fontSize: typography.size.sm,
      color: colors.primary.main,
      fontWeight: typography.weight.medium,
    },

    fab: {
      position: "absolute",
      right: spacing.lg,
      bottom: spacing.xl,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary.main,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: colors.primary.main,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },

    fabIcon: {
      fontSize: 32,
      color: colors.ui.white,
      fontWeight: typography.weight.medium,
      marginTop: -2,
    },
  });

export default JournalScreen;
