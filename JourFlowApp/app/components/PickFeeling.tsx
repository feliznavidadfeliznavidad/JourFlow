import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import LottieView from "lottie-react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import icons from "../../assets/icon/icon";
import { parse } from "date-fns";
import date_format from "../services/dateFormat_service";

const PickFeeling = () => {
  const { formattedDate } = useLocalSearchParams<{ formattedDate: any }>();
  const receiveDate = new Date(formattedDate);

  const [isSelect, setSelect] = useState<number>(-1);
  const [icon, setIcon] = useState<string>("");

  const handleButtonPress = (index: number, icon: string) => {
    setSelect(index);
    setIcon(icon);
  };

  const handleSubmit = () => {
    if (isSelect != -1) {
      router.push({
        pathname: "DetailScreen",
        params: { 
          icon , formattedDate
        },
      });
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.date}>{date_format(receiveDate).fullDate}</Text>
        <Text style={styles.headerText}>Pick your day's feeling</Text>
      </View>

      <View style={styles.emotionsContainer}>
        {Object.entries(icons).map((btn, index) => (
          <TouchableOpacity
            key={index}
            style={styles.buttonStyle}
            onPress={() => handleButtonPress(index, btn[0])}
          >
            <LottieView
              source={btn[1]}
              autoPlay
              loop
              style={[
                styles.lottieStyle,
                isSelect === index && styles.selectedEmoji,
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[styles.submitButton, { opacity: isSelect === -1 ? 0.2 : 1 }]}
          onPress={handleSubmit}
          disabled={isSelect === -1}
        >
          <Text style={styles.submitTitle}>
            <AntDesign name="arrowright" size={24} color="black" />
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PickFeeling;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#FAF7F0",
  },
  header: {
    padding: 24,
    marginBottom: 24,
    display:"flex",
    alignItems:"center",
    justifyContent:"center"
  },
  headerText: {
    fontSize: 18,
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#38434D",
    fontFamily: "Kalam-Regular",
  },
  emotionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    maxWidth: 960,
    marginHorizontal: "auto",
    marginBottom: 20,
  },
  buttonStyle: {
    width: 80,
    height: 80,
    margin: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAF7F0",
    borderRadius: 40,
  },
  lottieStyle: {
    width: 60,
    height: 60,
  },
  submitContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 100,
  },
  submitButton: {
    height: 50,
    width: 50,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "black",
    borderWidth: 1,
  },
  submitTitle: {
    fontSize: 18,
    color: "#FAF7F0",
    fontFamily: "Kalam-Regular",
  },
  selectedEmoji: {
    transform: [{ scale: 1.6 }],
  },
  date: {
    fontSize: 18,
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#1E1C1C",
    marginBottom: 10,
    fontFamily: "Kalam-Regular",
  },
});
