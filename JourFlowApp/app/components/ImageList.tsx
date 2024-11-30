import React from "react";
import { View, Image, FlatList, StyleSheet } from "react-native";

const ImageList = ({ images }: { images: { uri: string }[] }) => (
  <View style={styles.imageListContainer}>
    {images.length > 0 && (
      <FlatList
        horizontal
        data={images}
        keyExtractor={(item, index) => item.uri + index.toString()}
        renderItem={({ item }) => (
          <Image source={{ uri: item.uri }} style={styles.image} />
        )}
      />
    )}
  </View>
);

export default ImageList;

const styles = StyleSheet.create({
  imageListContainer: {
    marginBottom: 20,
    height: 140,
  },
  image: {
    width: 140,
    height: 140,
    marginRight: 10,
  },
});
