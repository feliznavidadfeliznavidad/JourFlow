import React from 'react';
import { View, Image, FlatList, StyleSheet } from 'react-native';

interface ImageListProps {
  images: { uri: string }[];
}

export const ImageList: React.FC<ImageListProps> = ({ images }) => {
  if (images.length === 0) return null;

  return (
    <View style={styles.imageListContainer}>
      <FlatList
        horizontal
        data={images}
        keyExtractor={(item, index) => item.uri + index.toString()}
        renderItem={({ item }) => (
          <Image source={{ uri: item.uri }} style={{ width: 200, height: 200 }} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  imageListContainer: {
    marginBottom: 20,
    height: 140,
  },
})