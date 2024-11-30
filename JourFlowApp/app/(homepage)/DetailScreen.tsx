import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import FontLoader from "../services/FontsLoader";
import LottieView from "lottie-react-native";
import Feather from "@expo/vector-icons/Feather";
import Entypo from "@expo/vector-icons/Entypo";
import * as ImagePicker from "expo-image-picker";
import icons, { IconPath } from "../../assets/icon/icon";
import * as FileSystem from "expo-file-system";
import DatabaseService from "../services/database_service";
import { format, parse } from "date-fns";
import date_format from "../services/dateFormat_service";

const Content = () => {
  const db = DatabaseService.db;

  const { icon, formattedDate } = useLocalSearchParams<{ icon: string; formattedDate: string }>();
  
  // const receiveDate = parse(date, "yyyy-MM-dd", new Date());

  const receiveDate = new Date(formattedDate);

  console.log("Received date on detail 1 : " + formattedDate)
  console.log("Received date on detail 2: " + receiveDate)
  console.log("Received date type on detail : " + typeof receiveDate)

  const iconKey = Array.isArray(icon) ? icon[0] : icon;
  
  const iconSource =
    iconKey && iconKey in icons ? icons[iconKey as IconPath] : icons["normal"];

  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");


  const [images, setImages] = useState<{ uri: string }[]>([]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({  
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const selectedImages = result.assets.map((asset) => ({
          uri: asset.uri,
        }));
        setImages(selectedImages);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  }

  const handleSubmit = async() => {
    if (!title.trim() && !content.trim()) {
      alert("Please enter a title or content");
      return;
    }
  
    try {
      const savedImgPaths = await saveImgsToLocalStorage();
  
      const iconPath = Array.isArray(icon) ? icon[0] : icon;
  
      const sanitizedTitle = title.replace(/'/g, "''");
      const sanitizedContent = content.replace(/'/g, "''");
      const sanitizedIconPath = iconPath.replace(/'/g, "''");
  
      // const formattedDate = format(receiveDate, "yyyy MM dd");
  
      const postResult = await db.runAsync(`
        INSERT INTO Posts (userId, Title, IconPath, Content, DateTime) 
        VALUES (?, ?, ?, ?, ?)
      `, [1, sanitizedTitle, sanitizedIconPath, sanitizedContent, receiveDate.toISOString()]);
  
      const postId = postResult.lastInsertRowId;
  
      if (savedImgPaths.length > 0) {
        await Promise.all(savedImgPaths.map(async (imgPath) => {
          await db.runAsync(`
            INSERT INTO IMGs (postId, url) 
            VALUES (?, ?)
          `, [postId, imgPath]);
        }));
      }
  
      setImages([]);
      setTitle('');
      setContent('');
  
      await fetchPostData();
      await fetchImgsData();

      router.replace("(homepage)/HomeScreen");
  
    } catch (error) {
      console.error("Error in handleSubmit: ", error);
      alert("Failed to create post. Please try again.");
    }
  };
  
  const fetchPostData = async () => {
    try {
      const user_infor = await db.getAllAsync("SELECT * FROM Posts");
      console.log(user_infor);
    } catch (error) {
      console.error("error when fetching: ", error);
    }
  };
  
  const fetchImgsData = async () => {
    try {
      const user_infor = await db.getAllAsync("SELECT * FROM IMGs");
      console.log(user_infor);
    } catch (error) {
      console.error("error when fetching: ", error);
    }
  };
  
  const saveImgsToLocalStorage = async () => {

    if (images.length === 0) return [];
  
    const folderUri = `${FileSystem.documentDirectory}/UserSavedImages`;
    
    await FileSystem.makeDirectoryAsync(folderUri, { intermediates: true });
  
    const imgLinks: string[] = [];
  
    await Promise.all(images.map(async (image, index) => {
      const filename = `image_${Date.now()}_${index}.jpg`;
      const newUri = `${folderUri}/${filename}`;
  
      console.log("Saved image to file " + filename);
      console.log("Saved image to path " + newUri);
  
      await FileSystem.copyAsync({
        from: image.uri,
        to: newUri,
      });
  
      imgLinks.push(newUri);
    }));
  
    return imgLinks;
  };

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
              <View style={styles.header}>
                <LottieView
                  source={iconSource}
                  autoPlay
                  loop
                  style={styles.feelingState}
                />

                <Text style={styles.date}>{date_format(receiveDate).fullDate}</Text>
                <Text style={styles.day}>{date_format(receiveDate).weekday}</Text>
              </View>

              {images.length > 0 && (
                <View style={styles.imageListContainer}>
                  <FlatList
                    horizontal
                    data={images}
                    keyExtractor={(item, index) => item.uri + index.toString()}
                    renderItem={({ item }) => (
                      <View
                        style={{
                          display: "flex",
                          justifyContent: "flex-start",
                          alignItems: "flex-start",
                          flexDirection: "row",
                        }}
                      >
                        <Image
                          source={{ uri: item.uri }}
                          style={{ width: 200, height: 200 }}
                        />
                      </View>
                    )}
                  />
                </View>
              )}

              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.content}>
                  <TextInput
                    placeholder="Title "
                    style={styles.titleInput}
                    value={title}
                    onChangeText={setTitle}
                  />
                  <TextInput
                    editable
                    multiline
                    value={content}
                    onChangeText={setContent}
                    style={styles.contentInput}
                    placeholder="Write about your day..."
                    scrollEnabled={false}
                  />
                </View>
              </TouchableWithoutFeedback>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.imageButton}
                onPress={() => {
                  pickImage();
                }}
              >
                <Feather name="image" size={28} color="black" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitContent}
                onPress={() => {
                  handleSubmit();
                }}
              >
                <Entypo name="check" size={28} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </FontLoader>
  );
};

export default Content;

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
  header: {
    padding: 20,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  feelingState: {
    width: 48,
    height: 48,
  },
  date: {
    fontSize: 18,
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#1E1C1C",
    marginBottom: 10,
    fontFamily: "Kalam-Regular",
  },
  day: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#AAA598",
    fontFamily: "Kalam-Regular",
  },
  imageListContainer: {
    marginBottom: 20,
    height: 140,
  },
  imageList: {
    flex: 1,
  },
  imageListContent: {
    alignItems: "center",
  },
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
  image: {
    width: 140,
    height: 140,
    marginRight: 10,
  },
});