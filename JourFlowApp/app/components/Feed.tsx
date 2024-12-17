import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import Card from "./Card";
import icons, { IconPath } from "../../assets/icon/icon";
import DatabaseService from "../services/database_service";
import Feather from "@expo/vector-icons/Feather";
import { router, usePathname } from "expo-router";

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

  const loadPosts = async () => {
    try {
      const data = await DatabaseService.getPosts();
      setPosts(data);
    } catch (error) {
      throw error;
    }
  };

  const handlePressSearch = () => {
    router.push({
      pathname: "/SearchScreen",
    });
  };

  const handlePostDelete = () => {
    loadPosts();
  };

  useEffect(() => {
    loadPosts();
  }, []);
  return (
    <SafeAreaView>
      <View style={styles.feedContainer}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="black" />
          </Pressable>
          <View style={styles.headerRight}>
            <Pressable onPress={() => handlePressSearch()}>
              <Feather name="search" size={24} color="black" />
            </Pressable>
          </View>
        </View>
        <ScrollView style={styles.scroll}>
          {posts.map((post, index) => {
            return (
              <View style={styles.Container} key={index}>
                <Card
                  key={index}
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
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Feed;

const styles = StyleSheet.create({
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
