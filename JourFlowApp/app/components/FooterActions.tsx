import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import Entypo from "@expo/vector-icons/Entypo";

const FooterActions = ({
  onPickImage,
  onSubmit,
}: {
  onPickImage: (newImages: { uri: string }[]) => void; // Chấp nhận tham số
  onSubmit: () => void;
}) => (
  <View style={styles.footer}>
    <TouchableOpacity style={styles.imageButton} onPress={() => onPickImage([])}>
      {/* onPickImage được gọi với một tham số */}
      <Feather name="image" size={28} color="black" />
    </TouchableOpacity>
    <TouchableOpacity style={styles.submitContent} onPress={onSubmit}>
      <Entypo name="check" size={28} color="black" />
    </TouchableOpacity>
  </View>
);

export default FooterActions;

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopColor: "black",
    borderTopWidth: 1,
    marginLeft: -20,
    marginRight: -20,
  },
  imageButton: {
    padding: 10,
    paddingLeft: 20,
  },
  submitContent: {
    padding: 10,
    paddingRight: 20,
  },
});
