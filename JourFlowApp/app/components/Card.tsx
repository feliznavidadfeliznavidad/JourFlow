import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  Animated,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import LottieView from "lottie-react-native";
import { Swipeable } from "react-native-gesture-handler";
import icons, { IconPath } from "../../assets/icon/icon";
import FontLoader from "../services/FontsLoader";
import date_format from "../services/dateFormat_service";
import DatabaseService from "../services/database_service";
import { router } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const { width, height } = Dimensions.get("window");

interface Post {
  id: number;
  user_id: number;
  title: string;
  icon_path: IconPath;
  content: string;
  post_date: string;
  update_date: string;  
  onDelete?: () => void;
}

interface Imgs {
  id: number;
  post_id: number;
  url: string;
}

const Card: React.FC<Post> = (post) => {
  const [imgs, setImgs] = useState<Imgs[]>([]);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const swipeableRef = useRef<Swipeable>(null);
  const timeoutRef = useRef<number>();
  const swipeStartTimeRef = useRef<number>(0);
  const dateString = new Date(post.post_date);

  const loadImgs = async () => {
    try {
      const data = await DatabaseService.getPostImages(post.id);

      if (data.length > 0) {
        setImgs(data);
      }
    } catch (error) {
      console.error("Error fetching images by post id:", error);
    }
  };

  useEffect(() => {
    loadImgs();
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [post.id]);

  const handleDelete = async () => {
    console.log("Deleting post:", post.id);
    try {
      if (post.id) {
        await DatabaseService.softDeletePost(post.id);
        if (post.onDelete) {
          post.onDelete();
        }
      }
    } catch (error) {
      console.error("Error in handleDelete: ", error);
      Alert.alert("Error", "Failed to delete post. Please try again.");
    }
  };

  const handleSwipeStart = () => {
    swipeStartTimeRef.current = Date.now();
    setIsSwipeActive(true);
  };

  const handleSwipeEnd = () => {
    const swipeDuration = Date.now() - swipeStartTimeRef.current;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Điều chỉnh thời gian chờ dựa trên thời lượng swipe
    const delayTime = swipeDuration < 200 ? 500 : 100;
    
    timeoutRef.current = setTimeout(() => {
      setIsSwipeActive(false);
    }, delayTime) as unknown as number;
  };

  const handlePress = () => {
    // Kiểm tra thêm thời gian từ khi bắt đầu swipe
    const timeSinceSwipeStart = Date.now() - swipeStartTimeRef.current;
    
    if (!isSwipeActive && timeSinceSwipeStart > 200) {
      router.push({
        pathname: "DetailScreen",
        params: { formattedDate: post.post_date },
      });
    }
  };

  const renderRightActions = () => {
    return (
      <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
        <MaterialIcons name="delete" size={28} color="white" />
      </TouchableOpacity>
    );
  };

  return (
    <FontLoader>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        onSwipeableWillOpen={handleSwipeStart}
        onSwipeableClose={handleSwipeEnd}
        overshootRight={false}
        rightThreshold={40}
      >
        <Pressable
          onPress={handlePress}
          disabled={isSwipeActive}
          style={({ pressed }) => [
            styles.cardContainer,
            pressed && !isSwipeActive && styles.cardPressed,
          ]}
        >
          <View style={styles.contentWrapper}>
            <View style={styles.cardLeft}>
              <View style={styles.header}>
                <View style={styles.iconArea}>
                  <LottieView
                    source={icons[post.icon_path]}
                    autoPlay
                    loop
                    style={styles.icon}
                  />
                </View>
                <View style={styles.dateArea}>
                  <Text style={styles.dateText}>
                    {date_format(dateString, "short").fullDate}
                  </Text>
                  <Text style={styles.weekdayText}>
                    {date_format(dateString, "short").weekday}
                  </Text>
                </View>
              </View>
              <View style={styles.contentArea}>
                <Text
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  style={styles.contentText}
                >
                  {post.title?.length > 0 ? post.title : post.content}
                </Text>
              </View>
            </View>
            <View style={styles.cardRight}>
              {imgs.length > 0 && (
                <View style={styles.imgContainer}>
                  <Image
                    source={{ uri: imgs[0].url }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                </View>
              )}
            </View>
          </View>
        </Pressable>
      </Swipeable>
    </FontLoader>
  );
};

// Styles remain the same
const styles = StyleSheet.create({
  cardContainer: {
    width: "90%",
    minHeight: height * 0.14,
    maxHeight: height * 0.2,
    padding: 16,
    marginVertical: 12,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderColor: "rgba(0, 0, 0, 0.1)",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignSelf: "center",
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  contentWrapper: {
    flex: 1,
    flexDirection: "row",
    width: "100%",
  },
  cardLeft: {
    flex: 3,
    marginRight: 16,
  },
  cardRight: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconArea: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  icon: {
    width: "100%",
    height: "100%",
  },
  dateArea: {
    flex: 1,
  },
  dateText: {
    fontFamily: "Kalam-Regular",
    fontSize: 14,
    color: "#333333",
    marginBottom: 2,
  },
  weekdayText: {
    fontFamily: "Kalam-Regular",
    fontSize: 12,
    color: "#666666",
  },
  contentArea: {
    flex: 1,
    justifyContent: "center",
  },
  contentText: {
    fontFamily: "Kalam-Regular",
    fontSize: 14,
    lineHeight: 20,
    color: "#333333",
  },
  imgContainer: {
    width: "86%",
    aspectRatio: 1,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f5f5f5",
  },

  deleteButton: {
    marginStart: "-8%",
    width: "20%",
    height: "83%",
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    marginEnd: 20
  },
});

export default Card;
