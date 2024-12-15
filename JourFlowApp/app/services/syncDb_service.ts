import { Alert } from "react-native";
import { IconPath } from "../../assets/icon/icon";
import DatabaseService from "./database_service";
import { uploadImageToCloudinary } from "./CloudinaryService";
import post_status from "../../assets/post_status";

const SERVER_API = "http://localhost:5004/api/posts";

interface Post {
  id: string;
  user_id: string;
  title: string;
  icon_path: IconPath;
  content: string;
  post_date: string;
  update_date: string;
  sync_status: number;
}

interface Image {
  id: string;
  post_id: string;
  url: string;
  public_id?: string;
  cloudinary_url?: string;
  sync_status: number;
}

class SyncDbService {
  private static async fetchWithErrorHandling(
    url: string,
    options: RequestInit,
    successMessage?: string
  ): Promise<string | null> {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.text();

      if (data === "success") {
        if (successMessage) {
          Alert.alert("Success", successMessage);
        }
        return data;
      }

      throw new Error("Unexpected server response");
    } catch (error) {
      console.error("Network or server error:", error);
      Alert.alert("Error", "An error occurred while syncing data");
      throw error;
    }
  }

  static async getPosts(userId: string): Promise<void> {
    try {
      const response = await fetch(`${SERVER_API}/get/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const { posts, images } = data;

      await DatabaseService.addSyncPosts(posts);
      if (images && images.length > 0) {
        await DatabaseService.syncServerImages(images);
      }
      console.log("Fetched posts and images:", data);
    } catch (error) {
      console.error("Error fetching posts and images:", error);
      Alert.alert("Sync Error", "Failed to fetch posts and images");
      throw error;
    }
  }
  static async addImages(datas: Image[]): Promise<void> {

    datas = await this.syncImages(datas);


    await this.fetchWithErrorHandling(
      `${SERVER_API}/add-image`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },  
        body: JSON.stringify(datas),
      },
      "Posts added successfully!"
    );

    await DatabaseService.updateImageSyncStatus();
  }
  static async addPosts(datas: Post[]): Promise<void> {


    await this.fetchWithErrorHandling(
      `${SERVER_API}/add-post`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },  
        body: JSON.stringify(datas),
      },
      "Posts added successfully!"
    );

    await DatabaseService.finishSyncAdd();
  }

  static async updatePosts(posts: Post[]): Promise<void> {
    await this.fetchWithErrorHandling(
      `${SERVER_API}/update`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(posts),
      },
      "Posts updated successfully!"
    );

    await DatabaseService.finishSyncUpdate();
  }

  static async deletePosts(posts: Post[]): Promise<void> {
    await this.fetchWithErrorHandling(
      `${SERVER_API}/delete`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(posts),
      },
      "Posts deleted successfully!"
    );

    await DatabaseService.finishSyncDelete();
  }

  static async syncImages(images: Image[]): Promise<Image[]> {
    try {
      const syncedImages: Image[] = [];

      for (const image of images) {
        if (!image.cloudinary_url) {
          const cloudinaryUrl = await uploadImageToCloudinary(image.url);
          
          if (cloudinaryUrl) {
            // Extract public_id from Cloudinary URL
            const publicId = cloudinaryUrl.split('/').pop()?.split('.')[0] || '';
            
            // Update local image record with Cloudinary info
            const updatedImage = await DatabaseService.updateImageCloudinaryInfo(
              image.id,
              publicId,
              cloudinaryUrl,
              post_status.not_sync
            );

            syncedImages.push({
              ...image,
              public_id: publicId,
              cloudinary_url: cloudinaryUrl,
              sync_status: post_status.not_sync
            });
          } else {
            console.warn(`Failed to upload image: ${image.id}`);
            syncedImages.push(image);
          }
        } else {
          syncedImages.push(image);
        }
      }

      return syncedImages;
    } catch (error) {
      console.error("Error in syncImages:", error);
      Alert.alert("Sync Error", "Failed to sync images");
      throw error;
    }
  }
}

export default SyncDbService;