// Content.tsx
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  StyleSheet,
  View,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import FontLoader from "../services/FontsLoader";
import * as ImagePicker from "expo-image-picker";
import icons, { IconPath } from "../../assets/icon/icon";
import * as FileSystem from "expo-file-system";
import DatabaseService from "../services/database_service";
import { Header } from '../components/HeaderDetail';
import { ImageList } from '../components/ImageList';
import { ContentInput } from '../components/ContentEditor';
import { Footer } from '../components/FooterActions';

interface Post {
  id: number;
  userId: number;
  Title: string;
  IconPath: IconPath;
  Content: string;
  PostDate: string;
  UpdateDate: string;
}

const Content = () => {
  const db = DatabaseService.db;
  const [postData, setPostData] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [images, setImages] = useState<{ uri: string }[]>([]);
  const [existingPost, setExistingPost] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPostId, setCurrentPostId] = useState<number | null>(null);

  const { icon, formattedDate } = useLocalSearchParams<{ icon: string; formattedDate: string }>();

  const receiveDate = new Date(formattedDate);
  const iconKey = Array.isArray(icon) ? icon[0] : icon;
  const iconSource = iconKey && iconKey in icons ? icons[iconKey as IconPath] : icons["normal"];

  const checkExists = async () => {
    try {
      const date = new Date(formattedDate);
      const exists = await DatabaseService.existingDateOfPost(date);
  
      if (exists) {
        setExistingPost(true);
        const post = await DatabaseService.getPostByDate(date);
  
        if (post && post.length > 0) {
          setPostData(post);
          setTitle(post[0].Title);
          setContent(post[0].Content);
          setCurrentPostId(post[0].id);
  
          const images = await DatabaseService.getImagesByPostId(post[0].id);
  
          if (images && images.length > 0) {
            const formattedImages = images.map((img) => ({ uri: img.url }));
            setImages(formattedImages);
          }
        }
      } else {
        setExistingPost(false);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error in checkExists:", error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleUpdate = async () => {
    if (!title.trim() && !content.trim()) {
      Alert.alert("Error", "Please enter a title or content");
      return;
    }

    try {
      const savedImgPaths = await saveImgsToLocalStorage();
      
      // Update post in database
      if (currentPostId) {
        await db.runAsync(
          `
          UPDATE Posts 
          SET Title = ?, Content = ?, UpdateDate = ?
          WHERE id = ?
          `,
          [title, content, new Date().toISOString(), currentPostId]
        );

        // Delete existing images
        await db.runAsync(
          `DELETE FROM IMGs WHERE postId = ?`,
          [currentPostId]
        );

        // Insert new images
        if (savedImgPaths.length > 0) {
          await Promise.all(
            savedImgPaths.map(async (imgPath) => {
              await db.runAsync(
                `INSERT INTO IMGs (postId, url) VALUES (?, ?)`,
                [currentPostId, imgPath]
              );
            })
          );
        }

        setIsEditing(false);
        Alert.alert("Success", "Post updated successfully");
        await checkExists(); // Refresh data
      }
    } catch (error) {
      console.error("Error in handleUpdate: ", error);
      Alert.alert("Error", "Failed to update post. Please try again.");
    }
  };

  const handleDelete = async () => {
    try {
      if (currentPostId) {
        // Delete images first (due to foreign key constraint)
        await db.runAsync(
          `DELETE FROM IMGs WHERE postId = ?`,
          [currentPostId]
        );

        // Delete post
        await db.runAsync(
          `DELETE FROM Posts WHERE id = ?`,
          [currentPostId]
        );

        Alert.alert("Success", "Post deleted successfully");
        router.replace("(homepage)/HomeScreen");
      }
    } catch (error) {
      console.error("Error in handleDelete: ", error);
      Alert.alert("Error", "Failed to delete post. Please try again.");
    }
  };


  // Hàm chọn ảnh
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        aspect: [1, 1],
        quality: 1,
      });
  
      if (!result.canceled) {
        const selectedImages = result.assets.map((asset) => ({ uri: asset.uri }));
        setImages(prevImages => [...prevImages, ...selectedImages]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };
  
  // Hàm lưu ảnh vào bộ nhớ
  const saveImgsToLocalStorage = async () => {
    if (images.length === 0) return [];

    const folderUri = `${FileSystem.documentDirectory}/UserSavedImages`;
    await FileSystem.makeDirectoryAsync(folderUri, { intermediates: true });

    const imgLinks: string[] = [];
    await Promise.all(
      images.map(async (image, index) => {
        const filename = `image_${Date.now()}_${index}.jpg`;
        const newUri = `${folderUri}/${filename}`;
        await FileSystem.copyAsync({ from: image.uri, to: newUri });
        imgLinks.push(newUri);
      })
    );

    return imgLinks;
  };

  // Hàm xử lý khi submit
  const handleSubmit = async () => {
    if (!title.trim() && !content.trim()) {
      alert("Please enter a title or content");
      return;
    }

    try {
      const savedImgPaths = await saveImgsToLocalStorage();

      const sanitizedTitle = title.replace(/'/g, "''");
      const sanitizedContent = content.replace(/'/g, "''");
      const sanitizedIconPath = iconKey.replace(/'/g, "''");

      const postResult = await db.runAsync(
        `
        INSERT INTO Posts (userId, Title, IconPath, Content, PostDate, UpdateDate) 
        VALUES (?, ?, ?, ?, ?, ?)
      `,
        [1, sanitizedTitle, sanitizedIconPath, sanitizedContent, receiveDate.toISOString(), new Date().toISOString()]
      );

      const postId = postResult.lastInsertRowId;

      if (savedImgPaths.length > 0) {
        await Promise.all(
          savedImgPaths.map(async (imgPath) => {
            await db.runAsync(`INSERT INTO IMGs (postId, url) VALUES (?, ?)`, [postId, imgPath]);
          })
        );
      }

      setImages([]);
      setTitle("");
      setContent("");
      router.replace("(homepage)/HomeScreen");
    } catch (error) {
      console.error("Error in handleSubmit: ", error);
      alert("Failed to create post. Please try again.");
    }
  };

  useEffect(() => {
    checkExists();
  }, []);

  return (
    <FontLoader>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <View style={styles.mainContent}>
            <ScrollView
              contentContainerStyle={styles.scrollViewContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Header iconSource={iconSource} receiveDate={receiveDate} />
              <ImageList images={images} />
              <ContentInput
                title={title}
                content={content}
                setTitle={setTitle}
                setContent={setContent}
                isReadOnly={existingPost && !isEditing}
              />
            </ScrollView>
            <Footer 
              onImagePick={pickImage}
              onSubmit={handleSubmit}
              onEdit={handleEdit}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              isExistingPost={existingPost}
              isEditing={isEditing}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </FontLoader>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF7F0",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
});

export default Content;