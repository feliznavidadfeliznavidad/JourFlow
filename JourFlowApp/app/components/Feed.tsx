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

interface Post {
  id: number;
  userId: number;
  Title: string;
  IconPath: IconPath;
  Content: string;
  PostDate: string;
  UpdateDate: string;
}

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  const loadPosts = async () => {
    try {
      const data = await DatabaseService.getPosts();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }

  const deleteall = async () => {
    try {
      await DatabaseService.clearDatabase();
      setPosts([]);
    } catch (error) {
      console.error("Error deleting all posts:", error);
    }
  };

  const showImgsDB = async () => {
    try {
      const data = await DatabaseService.getImages();
      console.log(data);
    } catch (error) {
      console.error("Error fetching images from database:", error);
    }
  };
  
  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <SafeAreaView>
      <View style={styles.feedContainer}>
        <Pressable onPress={() => deleteall()}>
          <Text>delete all</Text>
        </Pressable>
        <Pressable onPress={() => showImgsDB()}>
          <Text>Show Imgs DB</Text>
        </Pressable>
        <ScrollView style={styles.scroll}>
          {posts.map((post, index) => {
            return (
              <View style={styles.Container} key={index}>
                <Card
                  key={index}
                  id={post.id}
                  userId={post.userId}
                  Title={post.Title}
                  IconPath={post.IconPath}
                  Content={post.Content}
                  PostDate={post.PostDate}
                  UpdateDate={post.UpdateDate}
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
    display: "flex",
    alignItems: "center",
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