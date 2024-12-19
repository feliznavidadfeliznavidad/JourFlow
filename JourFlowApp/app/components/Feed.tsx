import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  Pressable,
  RefreshControl,
  Alert,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import Card from "./Card";
import { IconPath } from "../../assets/icon/icon";
import DatabaseService from "../services/database_service";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";

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

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const handleError = useCallback((error: unknown, context: string) => {
    console.error(`Error while ${context}:`, error);
    Alert.alert("Error", `An error occurred while ${context}`);
  }, []);

  const loadPosts = useCallback(async () => {
    try {
      const data = await DatabaseService.getPosts();
      setPosts(data);
    } catch (error) {
      handleError(error, "loading posts");
    }
  }, [handleError]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadPosts();
    } catch (error) {
      handleError(error, "refreshing posts");
    } finally {
      setRefreshing(false);
    }
  }, [loadPosts, handleError]);

  const handlePressSearch = useCallback(() => {
    router.push({
      pathname: "/SearchScreen",
    });
  }, []);

  const handlePostDelete = useCallback(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.feedContainer}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="black" />
          </Pressable>
          <View style={styles.headerRight}>
            <Pressable onPress={handlePressSearch}>
              <Feather name="search" size={24} color="black" />
            </Pressable>
          </View>
        </View>
        <ScrollView 
          style={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#000"]} 
              tintColor="#000"
            />
          }
        >
          {posts.map((post, index) => (
            <View style={styles.Container} key={post.id || index}>
              <Card
                id={post.id}
                user_id={post.user_id}
                title={post.title}
                icon_path={post.icon_path}
                content={post.content}
                post_date={post.post_date}
                sync_status={post.sync_status}
                update_date={post.update_date}
                onDelete={handlePostDelete}
              />
            </View>
          ))}
          <View style={styles.scrollPadding} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAF7F0",
  },
  Container: {
    width: "100%",
  },
  header: {
    padding: 16,
    width: "100%",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButton: {
    paddingHorizontal: 10,
  },
  scroll: {
    width: "100%",
    flex: 1,
  },
  scrollPadding: {
    height: 20, 
  },
  feedContainer: {
    height: "100%",
    width: "100%",
    display: "flex",
    alignItems: "center",
  },
  divider: {
    marginVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
});

export default Feed;