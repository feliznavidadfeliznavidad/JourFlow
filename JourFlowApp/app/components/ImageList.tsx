import React, { useState } from 'react';
import { View, Image, FlatList, StyleSheet } from 'react-native';

interface ImageListProps {
  images: { uri: string, cloudinaryUrl?: string }[]; 
}

export const ImageList: React.FC<ImageListProps> = ({ images }) => {
  if (images.length === 0) return null;

  const defaultImage = "https://s3v2.interdata.vn:9000/s3-586-15343-storage/dienthoaigiakho/wp-content/uploads/2024/01/16101418/trend-avatar-vo-danh-14.jpg";
  
  const [failedPrimaryUrls, setFailedPrimaryUrls] = useState<Set<string>>(new Set());
  const [failedCloudinaryUrls, setFailedCloudinaryUrls] = useState<Set<string>>(new Set());

  const getImageSource = (item: { uri: string, cloudinaryUrl?: string }) => {
    if (!failedPrimaryUrls.has(item.uri)) {
      return item.uri;
    }
    if (item.cloudinaryUrl && !failedCloudinaryUrls.has(item.cloudinaryUrl)) {
      return item.cloudinaryUrl;
    }
    return defaultImage;
  };

  return (
    <View style={styles.imageListContainer}>
      <FlatList
        horizontal
        data={images}
        keyExtractor={(item, index) => item.uri + index.toString()}
        renderItem={({ item }) => (
          <Image
            source={{ uri: getImageSource(item) }}
            style={{ width: 200, height: 200 }}
            onError={() => {
              if (!failedPrimaryUrls.has(item.uri)) {
                setFailedPrimaryUrls(prev => new Set(prev).add(item.uri));
                if (item.cloudinaryUrl) {
                  return;
                }
              }
              if (item.cloudinaryUrl && !failedCloudinaryUrls.has(item.cloudinaryUrl)) {
                setFailedCloudinaryUrls(prev => new Set(prev).add(item.cloudinaryUrl!));
              }
            }}
          />
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
});