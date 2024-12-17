import { Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
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
import { getItem } from "../services/async_storage";

interface UserInfo {
  username: string,
  email: string,
  avt_url: string,
}

const SettingScreen = () => {
  const { signOut } = useAuthorization();
  const [userInfo, setUserInfo] = useState<UserInfo>();
  const [isBackingUp, setIsBackingUp] = useState(false);
  
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const data = await DatabaseService.getCurrentUserInfo();
      setUserInfo(data);
    } catch (error) {
      throw error;
    }
  };

  const handlePress = () => {
    alert("Coming Soon!");
  };

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
      throw error;
    }
  };

  const handleLoadAllImgsPress = async () => {
    try {
      const data = await DatabaseService.getAllImages();
      console.log("images: ", data);
    } catch (error: any) {
      alert(error.message);
      throw error;
    }
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      const userId = await getItem("userId");
      const not_sync_posts = await DatabaseService.getNotSyncPosts();
      const not_sync_images = await DatabaseService.getNotSyncImages();
      const new_update_posts = await DatabaseService.getUpdatedPosts();
      const delete_posts = await DatabaseService.getDeletePosts();

      if (delete_posts.length > 0) {
        console.log("syncing delete posts");
        console.log(delete_posts);
        await SyncDbService.deletePosts(delete_posts);
      }

      if (not_sync_posts.length > 0) {
        console.log("syncing posts");
        console.log(not_sync_posts);
        await SyncDbService.addPosts(not_sync_posts);
      }

      if (not_sync_images.length > 0) {
        console.log("syncing images");
        console.log(not_sync_images);
        await SyncDbService.addImages(not_sync_images);
      }

      if (new_update_posts.length > 0) {
        console.log("syncing update posts");
        console.log(new_update_posts);
        await SyncDbService.updatePosts(new_update_posts);
      }

      await SyncDbService.getPosts(userId);
      alert("Backup process completed successfully.");
    } catch (error: any) {
      alert(error.message);
      throw error;
    } finally {
      setIsBackingUp(false);
    }
  };

  const printData = useCallback(async () => {
    try {
      const posts = await DatabaseService.getPosts();
      console.log("Posts:", posts);
    } catch (error) {
      handleError(error, "printing data");
    }
  }, []);

  const printUser = useCallback(async () => {
    try {
      const users = await DatabaseService.getUsers();
      console.log("Users:", users);
    } catch (error) {
      handleError(error, "printing data");
    }
  }, []);

  const addData = useCallback(async () => {
    try {
      await DatabaseService.insertFakePost();
      console.log("Data added successfully!");
    } catch (error) {
      handleError(error, "printing data");
    }
  }, []);

  return (
    <FontLoader>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="black" />
          </Pressable>
          <Text style={styles.title}>Setting</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.main}>
          <View style={styles.cardProfile}>
            <View style={styles.profileContent}>
              <Image
                style={styles.profileImage}
                source={{ uri: userInfo?.avt_url }}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.username}>{userInfo?.username}</Text>
                <View style={styles.zodiacContainer}>
                  <Text style={styles.zodiacText}>{userInfo?.email}</Text>
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
              style={[styles.settingItem, isBackingUp && styles.disabledItem]}
              onPress={isBackingUp ? undefined : handleBackup}
              disabled={isBackingUp}
            >
              <Feather name="cloud" size={24} color={isBackingUp ? "#999" : "black"} />
              <View style={styles.settingItemContent}>
                <Text style={[styles.settingText, isBackingUp && styles.disabledText]}>
                  Backup / Restore
                </Text>
                {isBackingUp && (
                  <ActivityIndicator size="small" color="#9747FF" style={styles.loader} />
                )}
              </View>
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
              <Text style={styles.settingText}>Print Data</Text>
            </Pressable>

            <Pressable style={styles.settingItem} onPress={() => printUser()}>
              <Feather name="code" size={24} color="black" />
              <Text style={styles.settingText}>Print User</Text>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAF7F0",
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontFamily: "Kalam-Regular",
    fontSize: 28,
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  settingItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loader: {
    marginLeft: 10,
  },
  disabledItem: {
    opacity: 0.7,
  },
  disabledText: {
    color: '#999',
  },
});

function handleError(error: unknown, action: string) {
  console.error(`Error while ${action}:`, error);
  alert(`An error occurred while ${action}`);
}

export default SettingScreen;