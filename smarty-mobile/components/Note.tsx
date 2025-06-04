import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Card } from "react-native-paper";
import { format } from "date-fns";
import { NoteWithCategory } from "../app/types";
import Colors from "../constants/Colors";

interface NoteProps {
  note: NoteWithCategory;
  onPress: () => void;
}

const Note: React.FC<NoteProps> = ({ note, onPress }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const maxContentLength = 120;
  const shouldShowMoreButton =
    note.content && note.content.length > maxContentLength;
  const displayContent = isExpanded
    ? note.content
    : note.content?.substring(0, maxContentLength) +
      (shouldShowMoreButton ? "..." : "");

  const wasUpdated = new Date(note.updatedAt) > new Date(note.createdAt);
  const createdUpdatedAtTimeStamp = format(
    new Date(wasUpdated ? note.updatedAt : note.createdAt),
    "MMM dd, yyyy HH:mm"
  );

  const handleToggleExpand = useCallback(
    (e: any) => {
      e.stopPropagation();
      setIsExpanded(!isExpanded);
    },
    [isExpanded]
  );

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Note: ${note.title}`}
      accessibilityHint="Double tap to edit this note">
      <View style={styles.card}>
        {/* Header with category badge */}
        <View style={styles.headerContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {note.category ? note.category.name : "No Category"}
            </Text>
          </View>
          <View style={styles.timestampContainer}>
            <Text style={styles.timestamp}>
              {format(
                new Date(wasUpdated ? note.updatedAt : note.createdAt),
                "MMM dd"
              )}
            </Text>
            {wasUpdated && <View style={styles.updatedIndicator} />}
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {note.title}
        </Text>

        {/* Content */}
        {note.content && (
          <View style={styles.contentContainer}>
            <Text
              style={styles.content}
              numberOfLines={isExpanded ? undefined : 3}>
              {displayContent}
            </Text>
            {shouldShowMoreButton && (
              <TouchableOpacity
                onPress={handleToggleExpand}
                style={styles.showMoreButton}
                accessibilityRole="button"
                accessibilityLabel={
                  isExpanded ? "Show less content" : "Show more content"
                }>
                <Text style={styles.showMoreText}>
                  {isExpanded ? "Show Less" : "Show More"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Footer with full timestamp */}
        <View style={styles.footerContainer}>
          <Text style={styles.fullTimestamp}>
            {createdUpdatedAtTimeStamp}
            {wasUpdated && " • edited"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  card: {
    backgroundColor: Colors.background.primary,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.gray[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.gray[100],
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: Colors.primary[50],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary[100],
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary[700],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  timestampContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timestamp: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.text.tertiary,
  },
  updatedIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary[500],
    marginLeft: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    lineHeight: 24,
    marginBottom: 8,
  },
  contentContainer: {
    marginBottom: 12,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.secondary,
  },
  showMoreButton: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  showMoreText: {
    fontSize: 13,
    color: Colors.primary[600],
    fontWeight: "600",
  },
  footerContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
    paddingTop: 12,
    marginTop: 4,
  },
  fullTimestamp: {
    fontSize: 11,
    color: Colors.text.tertiary,
    fontWeight: "500",
  },
});

export default Note;
