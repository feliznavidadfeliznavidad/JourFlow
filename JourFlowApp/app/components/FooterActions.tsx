// Footer.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Feather from "@expo/vector-icons/Feather";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface FooterProps {
  onImagePick?: () => void;
  onSubmit?: () => void;
  onEdit?: () => void;
  onUpdate?: () => void;
  onDelete?: () => void;
  isExistingPost: boolean;
  isEditing: boolean;
}

export const Footer: React.FC<FooterProps> = ({ 
  onImagePick, 
  onSubmit, 
  onEdit,
  onUpdate,
  onDelete,
  isExistingPost,
  isEditing
}) => {
  const handleDelete = () => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: onDelete,
          style: 'destructive'
        }
      ]
    );
  };

  if (isExistingPost && !isEditing) {
    return (
      <View style={styles.footer}>
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <MaterialIcons name="edit" size={28} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <MaterialIcons name="delete" size={28} color="black" />
        </TouchableOpacity>
      </View>
    );
  }

  if (isEditing) {
    return (
      <View style={styles.footer}>
        <TouchableOpacity style={styles.imageButton} onPress={onImagePick}>
          <Feather name="image" size={28} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.updateButton} onPress={onUpdate}>
          <MaterialIcons name="update" size={28} color="black" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.imageButton} onPress={onImagePick}>
        <Feather name="image" size={28} color="black" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.submitContent} onPress={onSubmit}>
        <Entypo name="check" size={28} color="black" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopColor: "black",
    borderTopWidth: 1,
    marginLeft: -20,
    marginRight: -20,
  },
  imageButton: {
    padding: 10,
    paddingLeft: 20,
  },
  submitContent: {
    padding: 10,
    paddingRight: 20,
  },
  editButton: {
    padding: 10,
    paddingLeft: 20,
  },
  deleteButton: {
    padding: 10,
    paddingRight: 20,
  },
  updateButton: {
    padding: 10,
    paddingRight: 20,
  }
});