import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Card } from "react-native-paper";
import { format } from "date-fns";
import { NoteWithCategory } from "../app/types";

interface NoteProps {
  note: NoteWithCategory;
  onPress: () => void;
}

const Note: React.FC<NoteProps> = ({ note, onPress }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const maxContentLength = 150;
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
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <Text style={styles.title} numberOfLines={2}>
          {note.title}
        </Text>

        <View style={styles.metaContainer}>
          <Text style={styles.category}>
            Category: {note.category ? note.category.name : "No Category"}
          </Text>
          <Text style={styles.timestamp}>
            {createdUpdatedAtTimeStamp}
            {wasUpdated && " (updated)"}
          </Text>
        </View>

        {note.content && (
          <View style={styles.contentContainer}>
            <Text style={styles.content}>{displayContent}</Text>
            {shouldShowMoreButton && (
              <TouchableOpacity
                onPress={handleToggleExpand}
                style={styles.showMoreButton}>
                <Text style={styles.showMoreText}>
                  {isExpanded ? "Show Less" : "Show More"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#1a1a1a",
  },
  metaContainer: {
    marginBottom: 12,
  },
  category: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
  },
  contentContainer: {
    marginTop: 8,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
  },
  showMoreButton: {
    marginTop: 8,
    alignSelf: "flex-start",
  },
  showMoreText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
});

export default Note;
