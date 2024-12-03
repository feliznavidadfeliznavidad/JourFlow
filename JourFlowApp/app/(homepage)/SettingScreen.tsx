import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import FontLoader from "../services/FontsLoader";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image } from "react-native";
import { router } from "expo-router";
import DatabaseService from "../services/database_service";
import SyncDbService from "../services/syncDb_service";
import { useAuthorization } from "../services/AuthProvider";

const SettingScreen = () => {
  const { status, signOut } = useAuthorization();
  const handlePress = () => {
    alert("Comming Soon!");
  };
  useEffect(() => {
    console.log("Status from setting screen: ", status);
  }, [status]);

  const handleSignOutPress = () => {
    signOut();
    router.navigate("/");
  };

  const handleDeleteAllPress = async () => {
    try {
      await DatabaseService.clearDatabase();
      alert("All posts have been deleted successfully!");
    } catch (error: any) {
      alert(error.message);
      console.error("Error deleting all posts:", error);
    }
  };

  const handleLoadAllImgsPress = async () => {
    try {
      const data = await DatabaseService.getAllImages();
      console.log(data);
      alert("All images have been loaded successfully!");
    } catch (error: any) {
      alert(error.message);
      console.error("Error load:", error);
    }
  };

  const handleBackup = async () => {
    try {
      const not_sync_posts = await DatabaseService.getNotSyncPosts();
      console.log(`not_sync_posts.length: ${not_sync_posts.length}`);
      const new_update_posts = await DatabaseService.getUpdatedPosts();
      console.log(`new_update_posts.length: ${new_update_posts.length}`);
      const delete_posts = await DatabaseService.getDeletePosts();
      console.log(`delete_posts.length: ${delete_posts.length}`);

      if (not_sync_posts.length > 0) {
        const add_response = await SyncDbService.addPosts(not_sync_posts);
        console.log(add_response);
      }
      if (new_update_posts.length > 0) {
        const update_response = await SyncDbService.updatePosts(
          new_update_posts
        );
        console.log(update_response);
      }
      if (delete_posts.length > 0) {
        const delete_response = await SyncDbService.deletePosts(delete_posts);
        console.log(delete_response);
      }
    } catch (error: any) {
      alert(error.message);
      console.error("Error backing up database:", error);
    }
  };

  const printData = useCallback(async () => {
    try {
      const posts = await DatabaseService.getPosts();
      console.log("Posts:", posts);

      // Optionally refresh marked dates after insertion
      // await loadMarkedDates();
    } catch (error) {
      handleError(error, "printing data");
    }
  }, [handleError]);

  const addData = useCallback(async () => {
    try {
      await DatabaseService.insertFakePost();
      console.log("Data added successfully!");
      // Optionally refresh marked dates after insertion
      // await loadMarkedDates();
    } catch (error) {
      handleError(error, "printing data");
    }
  }, [handleError]);

  return (
    <FontLoader>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>Setting</Text>
        <View style={styles.main}>
          <View style={styles.cardProfile}>
            <View style={styles.profileContent}>
              <Image
                style={styles.profileImage}
                source={{ uri: "https://your-profile-image-url.com" }}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.username}>ByKimThe</Text>
                <View style={styles.zodiacContainer}>
                  <MaterialCommunityIcons
                    name="zodiac-leo"
                    size={20}
                    color="#9747FF"
                  />
                  <Text style={styles.zodiacText}>leo</Text>
                </View>
              </View>
            </View>
            <Pressable style={styles.editButton} onPress={() => handlePress()}>
              <Feather name="external-link" size={24} color="black" />
            </Pressable>
          </View>

          <ScrollView
            style={styles.settingsList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.settingsListContent}
          >
            <Pressable style={styles.settingItem} onPress={() => handlePress()}>
              <Feather name="bell" size={24} color="black" />
              <Text style={styles.settingText}>Notifications</Text>
            </Pressable>

            <Pressable style={styles.settingItem} onPress={() => handlePress()}>
              <Feather name="type" size={24} color="black" />
              <Text style={styles.settingText}>Font</Text>
            </Pressable>

            <Pressable style={styles.settingItem} onPress={() => handlePress()}>
              <Feather name="moon" size={24} color="black" />
              <Text style={styles.settingText}>Dark mode</Text>
            </Pressable>

            <Pressable
              style={styles.settingItem}
              onPress={() => handleBackup()}
            >
              <Feather name="cloud" size={24} color="black" />
              <Text style={styles.settingText}>Backup / Restore</Text>
            </Pressable>

            <Pressable style={styles.settingItem} onPress={() => handlePress()}>
              <Feather name="globe" size={24} color="black" />
              <Text style={styles.settingText}>Language</Text>
            </Pressable>

            <Pressable style={styles.settingItem} onPress={() => handlePress()}>
              <Feather name="download" size={24} color="black" />
              <Text style={styles.settingText}>Export</Text>
            </Pressable>

            <Pressable style={styles.settingItem} onPress={() => handlePress()}>
              <Feather name="lock" size={24} color="black" />
              <Text style={styles.settingText}>Lock Screen</Text>
            </Pressable>

            <Pressable
              style={styles.settingItem}
              onPress={() => handleSignOutPress()}
            >
              <Feather name="log-out" size={24} color="black" />
              <Text style={styles.settingText}>Sign out</Text>
            </Pressable>

            <View>
              <Text style={styles.textDev}>Developer Tools</Text>
            </View>

            <Pressable
              style={styles.settingItem}
              onPress={() => handleDeleteAllPress()}
            >
              <Feather name="trash" size={24} color="black" />
              <Text style={styles.settingText}>Remove All Data</Text>
            </Pressable>

            <Pressable style={styles.settingItem} onPress={() => printData()}>
              <Feather name="code" size={24} color="black" />
              <Text style={styles.settingText}> Print Data</Text>
            </Pressable>
            <Pressable style={styles.settingItem} onPress={() => addData()}>
              <Feather name="code" size={24} color="black" />
              <Text style={styles.settingText}>Add Data</Text>
            </Pressable>
            <Pressable
              style={styles.settingItem}
              onPress={() => handleLoadAllImgsPress()}
            >
              <Feather name="list" size={24} color="black" />
              <Text style={styles.settingText}>Show All Images</Text>
            </Pressable>
          </ScrollView>
        </View>
      </SafeAreaView>
    </FontLoader>
  );
};

export default SettingScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAF7F0",
  },
  title: {
    fontFamily: "Kalam-Regular",
    fontSize: 28,
    textAlign: "center",
    marginVertical: 20,
  },
  main: {
    flex: 1,
    paddingHorizontal: 16,
  },
  cardProfile: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 24,
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontFamily: "Kalam-Regular",
    fontSize: 20,
    marginBottom: 4,
  },
  zodiacContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  zodiacText: {
    fontFamily: "Kalam-Regular",
    fontSize: 16,
    color: "#9747FF",
    marginLeft: 4,
  },
  editButton: {
    padding: 8,
  },
  settingsList: {
    flex: 1,
  },
  settingsListContent: {
    gap: 24,
    paddingLeft: 8,
    paddingRight: 8,
    paddingBottom: 24,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  settingText: {
    fontFamily: "Kalam-Regular",
    fontSize: 18,
    color: "#333333",
  },
  textDev: {
    fontFamily: "Kalam-Regular",
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
});

function handleError(error: unknown, arg1: string) {
  throw new Error("Function not implemented.");
}
