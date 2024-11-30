import { StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import FontLoader from "../services/FontsLoader";
import CustomCalendar from "../components/Calendar";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Feed from "../components/Feed";

const Tab = createMaterialTopTabNavigator();

export default function Page() {
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
          <Tab.Screen name="Left" component={CustomCalendar} />
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
