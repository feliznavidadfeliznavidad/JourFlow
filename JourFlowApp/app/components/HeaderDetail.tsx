import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import LottieView from "lottie-react-native";
import date_format from "../services/dateFormat_service";
import Feather from '@expo/vector-icons/Feather';

interface HeaderProps {
  iconSource: any;
  receiveDate: Date;
  onBack?: () => void;

}

export const Header: React.FC<HeaderProps> = ({ iconSource, receiveDate, onBack }) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="black" />
        </Pressable>
        <LottieView source={iconSource} autoPlay loop style={styles.feelingState} />
        <View style={styles.placeholder} />
      </View>
      <Text style={styles.date}>{date_format(receiveDate).fullDate}</Text>
      <Text style={styles.day}>{date_format(receiveDate).weekday}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  placeholder: {
    width: 40,
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