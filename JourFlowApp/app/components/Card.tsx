import { Dimensions, StyleSheet, Text, View, Image } from "react-native";
import React, { useEffect, useState } from "react";
import LottieView from "lottie-react-native";
import icons, { IconPath } from "../../assets/icon/icon";
import FontLoader from "../services/FontsLoader";
import date_format from "../services/dateFormat_service";
const { width, height } = Dimensions.get("window");
import { parse } from "date-fns";
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

interface Imgs {
  id: number;
  postId: number;
  url: string;
}

const Card: React.FC<Post> = (Post) => {
  const [imgs, setImgs] = useState<Imgs[]>([]);

  const dateString = new Date(Post.PostDate);
  // const formattedDateString = dateString.replace(/ /g, "-");
  // const receiveDate = parse(formattedDateString, "yyyy-MM-dd", new Date());

  const loadImgs = async () => {
    try {
      const data = await DatabaseService.getImagesByPostId(Post.id);
      if (data.length > 0) {
        setImgs(data);
      }
    } catch (error) {
      console.error("Error fetching images by post id:", error);
    }
  };

  useEffect(() => {
    loadImgs();
  }, []);

  return (
    <FontLoader>
      <View style={styles.cardContainer}>
        <View style={styles.contentWrapper}>
          <View style={styles.cardLeft}>
            <View style={styles.header}>
              <View style={styles.iconArea}>
                <LottieView
                  source={icons[Post.IconPath]}
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
                {Post.Title?.length > 0 ? Post.Title : Post.Content}
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
      </View>
    </FontLoader>
  );
};

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
});

export default Card;
