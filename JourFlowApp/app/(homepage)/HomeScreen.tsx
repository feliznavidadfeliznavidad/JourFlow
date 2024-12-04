import { StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import FontLoader from "../services/FontsLoader";
import CustomCalendar from "../components/Calendar";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Feed from "../components/Feed";
import { AuthProvider, useAuthorization } from "../services/AuthProvider";
import { useEffect } from "react";
import {
  getItem as getToken,
  setItem as setToken,
  removeItem as removeToken,
} from "../services/async_storage";
const Tab = createMaterialTopTabNavigator();

export default function Page() {
  const { status } = useAuthorization();
  useEffect(() => {
    const initState = async () => {
      const authToken = await getToken();
      console.log(
        "Token retrieved during initialization from homescreen:",
        authToken
      );
    };
    initState();
    console.log("status from homescreen: ", status);
  }, [status]);

  return (
    <FontLoader>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" backgroundColor="#FAF7F0" />
        <Tab.Navigator
          screenOptions={{
            swipeEnabled: true,
            tabBarShowLabel: false,
            tabBarStyle: { height: 0 },
          }}
        >
          <Tab.Screen name="Left">
            {() => <CustomCalendar reloadKey={Math.random()} />}
          </Tab.Screen>
          <Tab.Screen name="Right" component={Feed} />
        </Tab.Navigator>
      </SafeAreaView>
    </FontLoader>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAF7F0",
  },
});
