import React from "react";
import { View, Text, StyleSheet } from "react-native";
import date_format from "../services/dateFormat_service";

const Header = ({ date }: { date: string }) => {
  const formattedDate = new Date(date);
  return (
    <View style={styles.header}>
      <Text style={styles.date}>{date_format(formattedDate).fullDate}</Text>
      <Text style={styles.day}>{date_format(formattedDate).weekday}</Text>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  header: {
    padding: 20,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  date: {
    fontSize: 18,
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#1E1C1C",
    marginBottom: 10,
  },
  day: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#AAA598",
  },
});
