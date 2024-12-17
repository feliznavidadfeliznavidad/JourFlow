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
import { getItem } from "../services/async_storage";

interface Post {
  id: string;
  user_id: string;
  title: string;
  icon_path: IconPath;
  content: string;
  post_date: string;
  update_date: string;
  sync_status: number;
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
      throw error;
    }
  };

  const iconSource = icons[currentIcon as IconPath] || icons["normal"];

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleUpdate = async () => {
    console.warn("handleUpdate started");
  
    if (!title.trim() && !content.trim()) {
      console.warn("Validation failed: Empty title and content");
      Alert.alert("Error", "Please enter a title or content");
      return;
    }
  
    try {
      console.warn("Calling saveImgsToLocalStorage...");
      const savedImgPaths = await saveImgsToLocalStorage();
      console.warn("saveImgsToLocalStorage result:", savedImgPaths);
  
      const images = savedImgPaths.map((url) => ({
        url,
        public_id: "",
        cloudinary_url: ""
<<<<<<< HEAD
       }));

      // const updateData = { title, content, images };
      const updateData = { title, content};

=======
      }));
      console.warn("Formatted images:", images);
  
      const updateData = { title, content, images };
      console.warn("Update data prepared:", updateData);
  
>>>>>>> a019a2f5cff4716952102993fe8f26a9f5f3630c
      if (currentPostId) {
        console.warn("Updating post with ID:", currentPostId);
        await DatabaseService.updatePost(currentPostId, updateData);
  
        console.warn("Post updated successfully");
        setIsEditing(false);
        Alert.alert("Success", "Post updated successfully");
  
        console.warn("Checking if post exists...");
        await checkExists();
      } else {
        console.warn("No currentPostId provided");
      }
    } catch (error: any) {
      console.warn("Error caught:", error.message);
      Alert.alert("Error", "Failed to update post. Please try again.");
      throw error;
    }
  };

  // const handleUpdate = async () => {
  //   if (!title.trim() && !content.trim()) {
  //     Alert.alert("Error", "Please enter a title or content");
  //     return;
  //   }
  //   try {
  //     const savedImgPaths = await saveImgsToLocalStorage();

  //     const images = savedImgPaths.map((url) => ({
  //       url,
  //       public_id: "",
  //       cloudinary_url: ""
  //      }));

  //     const updateData = { title, content, images };

  //     if (currentPostId) {
  //       await DatabaseService.updatePost(currentPostId, updateData);

  //       setIsEditing(false);
  //       Alert.alert("Success", "Post updated successfully");
  //       await checkExists();
  //     }
  //   } catch (error) {
  //     Alert.alert("Error", "Failed to update post. Please try again.");
  //     throw error;
  //   }
  // };

  const handleDelete = async () => {
    try {
      if (currentPostId) {
        await DatabaseService.softDeletePost(currentPostId);
        Alert.alert("Success", "Post deleted successfully");
        router.replace("(homepage)/HomeScreen");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to delete post. Please try again.");
      throw error;
    }
  };

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
      throw error;
    }
  };

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

  const handleSubmit = async () => {
    if (!title.trim() && !content.trim()) {
      Alert.alert("Please enter a title or content");
      return;
    }
    try {
      const savedImgPaths = await saveImgsToLocalStorage();

      const images = savedImgPaths.map((url) => ({
        url,
        public_id: "",
        cloudinary_url: ""
       }));

      const post_date = receiveDate.toISOString();

      const postData = {
        title,
        content,
        icon_path: currentIcon,
        post_date,
        images: images,
      };

      await DatabaseService.createPost(postData);

      setImages([]);
      setTitle("");

      setContent("");

      router.replace("(homepage)/HomeScreen");

    } catch (error) {
      Alert.alert("Failed to create post. Please try again.");
      throw error;
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