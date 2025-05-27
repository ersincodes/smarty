import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Card, Chip, IconButton } from "react-native-paper";
import { Note } from "../app/types/note";
import { formatDistanceToNow } from "date-fns";

interface NoteCardProps {
  note: Note;
  onPress: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
  onShare: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onPress,
  onToggleFavorite,
  onDelete,
  onShare,
}) => {
  const handlePress = () => {
    onPress();
  };

  const handleToggleFavorite = () => {
    onToggleFavorite();
  };

  const handleDelete = () => {
    onDelete();
  };

  const handleShare = () => {
    onShare();
  };

  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + "...";
  };

  return (
    <Card style={styles.card} mode="elevated">
      <TouchableOpacity onPress={handlePress} style={styles.cardContent}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {note.title}
            </Text>
            {note.isAIGenerated && (
              <Chip
                icon="robot"
                compact
                style={styles.aiChip}
                textStyle={styles.aiChipText}>
                AI
              </Chip>
            )}
          </View>
          <View style={styles.actions}>
            <IconButton
              icon={note.isFavorite ? "heart" : "heart-outline"}
              iconColor={note.isFavorite ? "#e91e63" : "#666"}
              size={20}
              onPress={handleToggleFavorite}
            />
            <IconButton
              icon="share-variant"
              iconColor="#666"
              size={20}
              onPress={handleShare}
            />
            <IconButton
              icon="delete-outline"
              iconColor="#666"
              size={20}
              onPress={handleDelete}
            />
          </View>
        </View>

        <Text style={styles.content} numberOfLines={3}>
          {truncateContent(note.content)}
        </Text>

        {note.aiSummary && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryLabel}>AI Summary:</Text>
            <Text style={styles.summary} numberOfLines={2}>
              {note.aiSummary}
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.tags}>
            {note.tags.slice(0, 3).map((tag, index) => (
              <Chip
                key={index}
                compact
                style={styles.tag}
                textStyle={styles.tagText}>
                {tag}
              </Chip>
            ))}
            {note.tags.length > 3 && (
              <Text style={styles.moreTagsText}>
                +{note.tags.length - 3} more
              </Text>
            )}
          </View>

          <View style={styles.metadata}>
            {note.category && (
              <Text style={styles.category}>{note.category}</Text>
            )}
            <Text style={styles.date}>{formatDate(note.updatedAt)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: "#ffffff",
  },
  cardContent: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    flex: 1,
  },
  aiChip: {
    marginLeft: 8,
    backgroundColor: "#e3f2fd",
  },
  aiChipText: {
    fontSize: 10,
    color: "#1976d2",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  content: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  summaryContainer: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1976d2",
    marginBottom: 4,
  },
  summary: {
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  tags: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    flexWrap: "wrap",
  },
  tag: {
    marginRight: 6,
    marginBottom: 4,
    backgroundColor: "#e8f5e8",
  },
  tagText: {
    fontSize: 10,
    color: "#4caf50",
  },
  moreTagsText: {
    fontSize: 10,
    color: "#888",
    fontStyle: "italic",
  },
  metadata: {
    alignItems: "flex-end",
  },
  category: {
    fontSize: 11,
    color: "#1976d2",
    fontWeight: "500",
    textTransform: "capitalize",
  },
  date: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
});

export default NoteCard;
