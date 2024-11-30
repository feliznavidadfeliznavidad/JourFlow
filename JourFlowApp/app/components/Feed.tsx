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
      console.log(data);
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handlePressSearch = () => {
    alert("Comming Soon!");
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <SafeAreaView>
      <View style={styles.feedContainer}>
        <View style={styles.header}>
          <Pressable onPress={() => handlePressSearch()}>
            <Feather name="search" size={24} color="black" />
          </Pressable>
        </View>
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
  header: {
    padding: 16,
    width: "100%",
    justifyContent: "center",
    alignItems: "flex-end",
    marginRight: 10,
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
