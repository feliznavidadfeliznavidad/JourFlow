import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from "lottie-react-native";
import date_format from "../services/dateFormat_service";

interface HeaderProps {
  iconSource: any;
  receiveDate: Date;
}

export const Header: React.FC<HeaderProps> = ({ iconSource, receiveDate }) => {

  return (
    <View style={styles.header}>
      <LottieView source={iconSource} autoPlay loop style={styles.feelingState} />
      <Text style={styles.date}>{date_format(receiveDate).fullDate}</Text>
      <Text style={styles.day}>{date_format(receiveDate).weekday}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  feelingState: {
    width: 48,
    height: 48,
  },
  date: {
    fontSize: 18,
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#1E1C1C",
    marginBottom: 10,
    fontFamily: "Kalam-Regular",
  },
  day: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#AAA598",
    fontFamily: "Kalam-Regular",
  },
})
