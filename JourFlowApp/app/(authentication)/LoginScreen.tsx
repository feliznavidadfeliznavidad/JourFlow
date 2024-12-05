import React, { useEffect } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  SafeAreaView,
  Dimensions,
  Alert,
} from "react-native";
import "../../assets/fonts/Kalamfont/fonts";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import DatabaseService from "../services/database_service";
import FontLoader from "../services/FontsLoader";
import { useAuthorization } from "../services/AuthProvider";
import {
  getItem as getToken,
  setItem as setToken,
  removeItem as removeToken,
} from "../services/async_storage";
import { router, usePathname } from "expo-router";
import SyncDbService from "../services/syncDb_service";

const iosClientId =
  "1007829901637-iif9lnnsfvtnmoddt5fr1h1mcrmb93po.apps.googleusercontent.com";
  
const { width, height } = Dimensions.get("window");
const LoginScreen = () => {
  const config = {
    iosClientId,
  };
  const { signIn, status } = useAuthorization();
  useEffect(() => {
    const initState = async () => {
      const authToken = await getToken();
      await removeToken();
      console.log(
        "Token retrieved during initialization from login:",
        authToken
      );
    };
    initState();
    console.log("status from Login Screen:  ", status);
  }, [status]);

  WebBrowser.maybeCompleteAuthSession();
  const [request, response, promptAsync] = Google.useAuthRequest(config);
  const handleJWT = async (googleToken: any) => {
    var response = await fetch("http://localhost:5004/api/auth/google-signin", {
      // var response = await fetch(
      //   "http://192.168.2.171:5004/api/auth/google-signin",
      //   {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        idToken: googleToken,
      }),
    });
    if (response.ok) {
      console.log("response status of posting to server: ", response.status);
      const userIdentity = await response.json();
      console.log("JWT from server: ", userIdentity.token);
      await signIn(userIdentity.token);
      await router.replace({
        pathname: "(homepage)/HomeScreen",
      });

      router.push("(homepage)/HomeScreen");
      const user = DatabaseService.getUsers();
      if (!user || (await user).length === 0) {
        DatabaseService.insertDynamicUser(
          userIdentity.userName,
          userIdentity.token,
          googleToken,
          userIdentity.refreshToken
        );
      } else {
        console.log("JWT FROM SERVER IN ELSE CONDITION: ", userIdentity.token);
        DatabaseService.updateJWT(userIdentity.token, 1);
      }
      await SyncDbService.getPosts();
    } else {
      console.log("something wrong");
    }
  };
  const handleToken = () => {
    if (response?.type == "success") {
      const { authentication } = response;
      const token = authentication?.idToken;
      handleJWT(token);
      console.log("idToken: ", token);
    }
  };
  useEffect(() => {
    handleToken();
  }, [response]);

  return (
    <FontLoader>
      <SafeAreaView style={styles.container}>
        <View style={styles.welcomeHeaderContainer}>
          <Text style={styles.welcomeHeaderTitle}>Welcome back</Text>
          <Image
            style={styles.welcomeImg}
            source={require("../../assets/images/welcomebackImg.png")}
          />
        </View>
        <View style={styles.bottomDescriptionContainer}>
          <Text style={[styles.bottomDescription, styles.abu]}>About us: </Text>
          <Text style={styles.bottomDescription}>
            We created this app to help you capture life's moments and reflect
            on your journey. We believe journaling is a path to
            self-understanding and growth.
          </Text>
        </View>
        <View style={styles.buttonArea}>
          <Animated.View style={[styles.skipButtonContainer]}>
            <Pressable style={styles.skipButton}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </Pressable>
          </Animated.View>

          <Animated.View style={[styles.googleButtonContainer]}>
            <Pressable
              style={styles.googleButton}
              onPress={async () => {
                console.log("google login");
                promptAsync();
              }}
            >
              <Image
                source={require("../../assets/images/logos/Google_logo.png")}
                style={styles.logo}
              />
              <Text style={styles.googleButtonText}>Login with Google</Text>
            </Pressable>
          </Animated.View>
        </View>
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
    backgroundColor: "#9092E2",
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
    width: width * 0.6,
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
    marginTop: "20%",
    fontSize: 16,
    fontFamily: "Kalam-Regular",
  },
  abu: {
    marginBottom: -65,
  },
  buttonArea: {
    width: "90%",
    height: 50,
    display: "flex",
    flexDirection: "row",
    position: "absolute",
    bottom: 80,
  },
  skipButtonContainer: {
    flex: 2,
  },
  skipButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  skipButtonText: {
    fontFamily: "Kalam-Regular",
    fontSize: 18,
  },
  googleButtonContainer: {
    flex: 3,
  },
  googleButton: {
    flex: 1,
    backgroundColor: "#b4b6ed",
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    borderRadius: 25,
  },
  googleButtonText: {
    fontFamily: "Kalam-Regular",
    fontSize: 18,
  },
  logo: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
});
export default LoginScreen;
