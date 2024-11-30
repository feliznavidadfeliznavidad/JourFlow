// Content.tsx
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  StyleSheet,
  View,
  Platform,
  ScrollView,
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
  const [existingPost, setExistingPost] = useState(false); // Thêm state để track trạng thái post

  const { icon, formattedDate } = useLocalSearchParams<{ icon: string; formattedDate: string }>();

  const receiveDate = new Date(formattedDate);
  const iconKey = Array.isArray(icon) ? icon[0] : icon;
  const iconSource = iconKey && iconKey in icons ? icons[iconKey as IconPath] : icons["normal"];

  const checkExists = async () => {
    try {
      const date = new Date(formattedDate);
      const exists = await DatabaseService.existingDateOfPost(date);
  
      if (exists) {
        setExistingPost(true); // Set trạng thái là đã tồn tại post
        
        // Lấy thông tin bài viết
        const post = await DatabaseService.getPostByDate(date);
  
        if (post && post.length > 0) {
          setPostData(post);
          setTitle(post[0].Title);
          setContent(post[0].Content);
  
          // Lấy danh sách hình ảnh liên quan đến bài viết
          const images = await DatabaseService.getImagesByPostId(post[0].id);
  
          if (images && images.length > 0) {
            const formattedImages = images.map((img) => ({ uri: img.url }));
            setImages(formattedImages);
          }
        }
      } else {
        setExistingPost(false); // Set trạng thái là chưa tồn tại post
      }
    } catch (error) {
      console.error("Error in checkExists:", error);
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
        setImages(selectedImages);
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
                isReadOnly={existingPost} // Truyền prop để control chế độ read-only
              />
            </ScrollView>
            {/* Chỉ hiển thị Footer nếu chưa tồn tại post */}
            {!existingPost && (
              <Footer onImagePick={pickImage} onSubmit={handleSubmit} />
            )}
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