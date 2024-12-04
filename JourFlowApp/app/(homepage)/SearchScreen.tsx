import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconPath } from "../../assets/icon/icon";
import DatabaseService from "../services/database_service";
import { router } from "expo-router";
import Card from "../components/Card";

interface Post {
  id: string;
  user_id: number;
  title: string;
  icon_path: IconPath;
  content: string;
  post_date: string;
  update_date: string;
}

const SearchScreen = () => {
  const [searchResult, setSearchResult] = useState("");
  const [orgPosts, setOrgPosts] = useState<Post[]>([]);
  const [filterPosts, setFilterPosts] = useState<Post[]>([]);

  const loadPosts = async () => {
    try {
      const data = await DatabaseService.getPosts();
      setOrgPosts(data);
      setFilterPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    const filteredPosts = orgPosts.filter((post) => {
      const searchText = searchResult.toLowerCase();
      return (
        post.title.toLowerCase().includes(searchText) || // Kiểm tra nếu title chứa chuỗi tìm kiếm
        post.content.toLowerCase().includes(searchText) // Kiểm tra nếu content chứa chuỗi tìm kiếm
      );
    });
    setFilterPosts(filteredPosts);
  }, [searchResult, orgPosts]);

  return (
    <View style={styles.searchScreen}>
      <SafeAreaView>
        <TextInput
          style={styles.searchBar}
          onChangeText={setSearchResult}
          value={searchResult}
        />
        <ScrollView style={styles.scroll}>
          {filterPosts.map((post, index) => {
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
                  update_date={post.update_date}
                />
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  searchScreen: {
    flex: 1,
    backgroundColor: "#FAF7F0",
  },
  searchBar: {
    marginTop: 30,
    height: 50,
    margin: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    borderColor: "#ddd",
    fontSize: 16,
  },
  scroll: {
    width: "100%",
  },
  Container: {
    width: "100%",
  },
});
