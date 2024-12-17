import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconPath } from "../../assets/icon/icon";
import DatabaseService from "../services/database_service";
import { router } from "expo-router";
import Card from "../components/Card";
import Feather from "@expo/vector-icons/Feather";

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
        <View style={styles.searchHeader}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="black" />
          </Pressable>
          <TextInput
            style={styles.searchBar}
            onChangeText={setSearchResult}
            value={searchResult}
            placeholder="Search..."
          />
        </View>
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
                  sync_status={post.sync_status}
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

const styles = StyleSheet.create({
  searchScreen: {
    flex: 1,
    backgroundColor: "#FAF7F0",
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 30,
  },
  searchBar: {
    flex: 1,
    height: 50,
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
  backButton: {
    padding: 8,
    marginRight: 8,
  },
});

export default SearchScreen;