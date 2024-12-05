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
import { Header } from "../components/HeaderDetail";
import { ImageList } from "../components/ImageList";
import { ContentInput } from "../components/ContentEditor";
import { Footer } from "../components/FooterActions";
import { useAuthorization } from "../services/AuthProvider";
interface Post {
  id: string;
  user_id: number;
  title: string;
  icon_path: IconPath;
  content: string;
  post_date: string;
  update_date: string;
}


const Content = () => {
  const [postData, setPostData] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [images, setImages] = useState<{ uri: string }[]>([]);
  const [existingPost, setExistingPost] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);
  const [currentIcon, setCurrentIcon] = useState<string>("normal");

  const params = useLocalSearchParams<{
    icon?: string;
    formattedDate: string;
  }>();
  const formattedDate = params.formattedDate;
  const iconFromParams = params.icon;

  const receiveDate = new Date(formattedDate);
  const { status } = useAuthorization();
  useEffect(() => {
    console.log("rom detail screen: ", status);
  }, [status]);
  const checkExists = async () => {
    try {
      const date = new Date(formattedDate);
      const exists = await DatabaseService.hasPostsOnDate(date);

      if (exists) {
        setExistingPost(true);
        const post = await DatabaseService.getPostsByDate(date);

        if (post && post.length > 0) {
          setPostData(post);
          setTitle(post[0].title);
          setContent(post[0].content);
          setCurrentPostId(post[0].id);
          if (!iconFromParams) {
            setCurrentIcon(post[0].icon_path);
          } else {
            setCurrentIcon(iconFromParams);
          }

          const images = await DatabaseService.getPostImages(post[0].id);
          if (images && images.length > 0) {
            const formattedImages = images.map((img) => ({ uri: img.url }));
            setImages(formattedImages);
          }
        }
      } else {
        setExistingPost(false);
        setIsEditing(false);
        setCurrentIcon(iconFromParams || "normal");
      }
    } catch (error) {
      console.error("Error in checkExists:", error);
    }
  };

  const iconSource = icons[currentIcon as IconPath] || icons["normal"];

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleUpdate = async () => {
    if (!title.trim() && !content.trim()) {
      Alert.alert("Error", "Please enter a title or content");
      return;
    }

    try {
      const images = await saveImgsToLocalStorage();
      const updateData = { title, content, images };

      if (currentPostId) {
        await DatabaseService.updatePost(currentPostId, updateData);

        setIsEditing(false);
        Alert.alert("Success", "Post updated successfully");
        await checkExists();
      }
    } catch (error) {
      console.error("Error in handleUpdate: ", error);
      Alert.alert("Error", "Failed to update post. Please try again.");
    }
  };

  const handleDelete = async () => {
    try {
      if (currentPostId) {
        await DatabaseService.softDeletePost(currentPostId);
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
        const selectedImages = result.assets.map((asset) => ({
          uri: asset.uri,
        }));
        setImages((prevImages) => [...prevImages, ...selectedImages]);
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
      Alert.alert("Please enter a title or content");
      return;
    }

    try {
      const savedImgPaths = await saveImgsToLocalStorage();
      const user_id = 1;

      const post_date = receiveDate.toISOString();

      const postData = {
        title,
        content,
        icon_path: currentIcon,
        user_id,
        post_date,
        images: savedImgPaths,
      };

      await DatabaseService.createPost(postData);

      setImages([]);
      setTitle("");
      setContent("");
      router.replace("(homepage)/HomeScreen");
    } catch (error) {
      console.error("Error in handleSubmit: ", error);
      Alert.alert("Failed to create post. Please try again.");
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
              <Header iconSource={iconSource} receiveDate={receiveDate} onBack={() => router.back()}/>
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
