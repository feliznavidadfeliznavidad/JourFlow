import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system";
import FontLoader from "./services/FontsLoader";
import WelComePage from "./(authentication)/WelcomeScreen";
import DatabaseService from "./services/database_service";

export default function Page() {
  const checkFolder = async () => {
    const folderUri = `${FileSystem.documentDirectory}/UserSavedImages`;

    const folderInfo = await FileSystem.getInfoAsync(folderUri);
    if (!folderInfo.exists) {
      await FileSystem.makeDirectoryAsync(folderUri, { intermediates: true });
      console.log("Folder created at: " + folderUri);
    }
  };

  const initializeApp = async () => {
    try {
      await DatabaseService.init();
    } catch (error) {
      handleError(error, "initializing app");
    }
  };

  useEffect(() => {
    checkFolder();
    initializeApp();
  }, []);

  return (
    <FontLoader>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" backgroundColor="#FAF7F0" />
          <WelComePage />
      </SafeAreaView>
    </FontLoader>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAF7F0",
  }
});
function handleError(error: unknown, arg1: string) {
  throw new Error("Function not implemented.");
}

