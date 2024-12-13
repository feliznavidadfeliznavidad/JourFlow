import { Alert } from "react-native";
import { IconPath } from "../../assets/icon/icon";
import DatabaseService from "./database_service";
import { uploadImageToCloudinary } from "./CloudinaryService";

const SERVER_API = "http://localhost:5004/api/posts";

interface Post {
  id: string;
  user_id: number;
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
  public_id: string;
  cloudinary_url: string;
  sync_status: number;
}

class SyncDbService {
  private static async fetchWithErrorHandling(
    url: string,
    options: RequestInit,
    successCallback?: () => void
  ): Promise<string | null> {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.text();

      if (data === "success") {
        successCallback?.();
        return data;
      }

      throw new Error("Unexpected server response");
    } catch (error) {
      console.error("Network or server error:", error);
      throw error;
    }
  }

  //   static async getPosts(): Promise<void> {
  //     try {
  //       const response = await fetch(`${SERVER_API}/get`);

  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }

  //       const posts = await response.json();
  //       DatabaseService.addSyncPosts(posts);
  //       console.log("Fetched posts:", posts);
  //     } catch (error) {
  //       console.error("Error fetching posts:", error);
  //       throw error;
  //     }
  //   }

  static async getPosts(): Promise<void> {
    try {
      const response = await fetch(`${SERVER_API}/get`);
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
      throw error;
    }
  }

  static async addPosts(posts: Post[]): Promise<void> {
    await this.fetchWithErrorHandling(
      `${SERVER_API}/add`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },  
        body: JSON.stringify(posts),
      },
      () => {
        DatabaseService.finishSyncAdd();
        alert("Posts added successfully!");
      }
    );
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
      () => {
        DatabaseService.finishSyncUpdate();
        alert("Posts updated successfully!");
      }
    );
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
      () => {
        DatabaseService.finishSyncDelete();
        alert("Posts deleted successfully!");
      }
    );
  }

  // static async syncImages(images: Image[]): Promise<void> {
  //   await this.fetchWithErrorHandling(
  //     `${SERVER_API}/sync-images`,
  //     {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(images),
  //     },
  //     () => {
  //       images.forEach(async (image) => {
  //         await DatabaseService.updateImageSyncStatus(image.id, 1);
  //       });
  //       alert("Images synced successfully!");
  //     }
  //   );
  // }

  static async syncImages(images: Image[]): Promise<void> {
    try {
      // First upload any unsynced images to Cloudinary
      const uploadPromises = images.map(async (image) => {
        if (!image.cloudinary_url) {
          const cloudinaryUrl = await uploadImageToCloudinary(image.url);
          if (cloudinaryUrl) {
            // Extract public_id from Cloudinary URL
            const publicId = cloudinaryUrl.split('/').pop()?.split('.')[0] || '';
            
            // Update local image record with Cloudinary info
            await DatabaseService.updateImageCloudinaryInfo(
              image.id,
              publicId,
              cloudinaryUrl,
              1
            );
            
            return {
              ...image,
              public_id: publicId,
              cloudinary_url: cloudinaryUrl,
              sync_status: 1
            };
          }
        }
        return image;
      });
  
      // Wait for all Cloudinary uploads to complete
      const updatedImages = await Promise.all(uploadPromises);
  
      console.log("UPLOAD IMAGE BY DUY ", updatedImages[0]);
      // Then sync with server
      await this.fetchWithErrorHandling(
        `${SERVER_API}/sync-images`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedImages),
        },
        async () => {
          // Update sync status after successful server sync
          for (const image of updatedImages) {
            await DatabaseService.updateImageSyncStatus(image.id, 1);
          }
          alert("Images synced successfully!");
        }
      );
    } catch (error) {
      console.error("Error in syncImages:", error);
      throw error;
    }
  }
}

export default SyncDbService;
