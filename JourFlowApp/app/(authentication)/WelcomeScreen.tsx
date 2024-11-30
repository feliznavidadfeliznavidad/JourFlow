import React, { useRef } from "react";
import {
  Text,
  Image,
  View,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Pressable,
  Animated,
} from "react-native";
import FontLoader from "../services/FontsLoader";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");

const WelComeScreen = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <FontLoader>
      <SafeAreaView style={styles.container}>
        <View style={styles.welcomeHeaderContainer}>
          <Text style={styles.welcomeHeaderTitle}>Welcome</Text>
          <Image
            style={styles.welcomeImg}
            source={require("../../assets/images/welcomeImg1st.png")}
          />
        </View>
        <View style={styles.bottomDescriptionContainer}>
          <Text style={styles.bottomDescription}>
            Every day holds a story worth remembering. Write down your thoughts,
            track your growth, and find meaning in the little moments. Let this
            journal be a space where you explore your past, embrace the present,
            and shape the future—one day, one page, one thought at a time.
          </Text>
        </View>
        <Animated.View
          style={[
            styles.nextButton,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Pressable
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={() => {
              router.push({
                pathname: "/LoginScreen",
              });
            }}
            style={styles.pressableArea}
          >
            <Text style={styles.nextText}>Next</Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </FontLoader>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
  },
  welcomeHeaderContainer: {
    display: "flex",
    width: "100%",
    marginTop: "-15%",
    flex: 3,
    backgroundColor: "#E29092",
    alignItems: "center",
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  welcomeHeaderTitle: {
    marginTop: "20%",
    fontFamily: "Kalam-Regular",
    fontSize: 26,
    color: "white",
  },
  welcomeImg: {
    position: "absolute",
    width: width * 0.55,
    height: height * 0.55,
    resizeMode: "contain",
    marginTop: 70,
  },
  bottomDescriptionContainer: {
    flex: 3,
    width: "80%",
    position: "relative",
  },
  bottomDescription: {
    lineHeight: 24,
    marginTop: "25%",
    fontSize: 16,
    fontFamily: "Kalam-Regular",
  },
  nextButton: {
    width: 130,
    height: 45,
    borderRadius: 24,
    backgroundColor: "#edb4b5",
    position: "absolute",
    bottom: 100,
    overflow: "hidden",
  },
  pressableArea: {
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  nextText: {
    fontFamily: "Kalam-Regular",
    fontSize: 18,
  },
});

export default WelComeScreen;