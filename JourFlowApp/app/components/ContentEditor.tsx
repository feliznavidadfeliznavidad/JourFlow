import React from 'react';
import { View, TextInput, TouchableWithoutFeedback, Keyboard, StyleSheet } from 'react-native';

interface ContentInputProps {
  title: string;
  content: string;
  setTitle: (text: string) => void;
  setContent: (text: string) => void;
  isReadOnly: boolean;  
}

export const ContentInput: React.FC<ContentInputProps> = ({
  title,
  content,
  setTitle,
  setContent,
  isReadOnly
}) => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.content}>
        <TextInput
          placeholder="Title "
          style={[styles.titleInput, isReadOnly && styles.readOnlyInput]}
          value={title}
          onChangeText={setTitle}
          editable={!isReadOnly}
        />
        <TextInput
          multiline
          value={content}
          onChangeText={setContent}
          style={[styles.contentInput, isReadOnly && styles.readOnlyInput]}
          placeholder="Write about your day..."
          scrollEnabled={false}
          editable={!isReadOnly}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  titleInput: {
    padding: 10,
    textAlignVertical: "top",
    fontFamily: "Kalam-Regular",
  },
  contentInput: {
    minHeight: 200,
    padding: 10,
    textAlignVertical: "top",
    fontFamily: "Kalam-Regular",
  },
  readOnlyInput: {
    color: '#666',
    backgroundColor: '#f5f5f5',
  }
});