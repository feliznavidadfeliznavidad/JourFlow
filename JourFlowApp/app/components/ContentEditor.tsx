import React from "react";
import { View, TextInput, StyleSheet } from "react-native";

const ContentEditor = ({
  title,
  content,
  onTitleChange,
  onContentChange,
}: {
  title: string;
  content: string;
  onTitleChange: (text: string) => void;
  onContentChange: (text: string) => void;
}) => (
  <View style={styles.content}>
    <TextInput
      placeholder="Title"
      style={styles.titleInput}
      value={title}
      onChangeText={onTitleChange}
    />
    <TextInput
      editable
      multiline
      value={content}
      onChangeText={onContentChange}
      style={styles.contentInput}
      placeholder="Write about your day..."
    />
  </View>
);

export default ContentEditor;

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  titleInput: {
    padding: 10,
    textAlignVertical: "top",
  },
  contentInput: {
    minHeight: 200,
    padding: 10,
    textAlignVertical: "top",
  },
});
