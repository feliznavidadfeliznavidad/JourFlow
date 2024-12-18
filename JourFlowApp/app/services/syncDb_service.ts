import { Alert } from "react-native";
import { IconPath } from "../../assets/icon/icon";
import DatabaseService from "./database_service";
import { uploadImageToCloudinary } from "./CloudinaryService";
import post_status from "../../assets/post_status";
import { getItem } from "./async_storage";

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
  ): Promise<string | null> {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.text();

      if (data === "success") {
        return data;
      }

      throw new Error("Unexpected server response");
    } catch (error) {

      Alert.alert("Error", "An error occurred while syncing data");
      throw error;
    }
  }

  static async getPosts(userId: string): Promise<void> {
    try {
      const jwt = await getItem("jwt");
      const response = await fetch(`${SERVER_API}/get/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const { posts, images } = data;

      await DatabaseService.syncDatas(posts, images);



    } catch (error) {

      Alert.alert("Sync Error", "Failed to fetch posts and images");
      throw error;
    }
  }

  static async addImages(datas: Image[]): Promise<void> {
    try {
      const jwt = await getItem("jwt");
      console.log("Initial datas:", datas); // Kiểm tra dữ liệu đầu vào

      // Gọi syncImages và log kết quả
      datas = await this.syncImages(datas);
      console.log("After syncImages, datas:", datas);
  
      // Log URL và body trước khi gọi API
      const url = `${SERVER_API}/add-image`;
      console.log("API URL:", url);
      console.log("Request body:", JSON.stringify(datas));
  
      // Gọi fetchWithErrorHandling và log thông báo
      await this.fetchWithErrorHandling(
        url,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify(datas),
        }
      );
      console.log("API call completed successfully!");
  
      // Gọi updateImageSyncStatus và log thông báo
      await DatabaseService.updateImageSyncStatus();
      console.log("Image sync status updated!");
    } catch (error) {
      console.error("Error in addImages:", error);
    }
  }
  
  // static async addImages(datas: Image[]): Promise<void> {

  //   datas = await this.syncImages(datas);


  //   await this.fetchWithErrorHandling(
  //     `${SERVER_API}/add-image`,
  //     {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },  
  //       body: JSON.stringify(datas),
  //     },
  //     "Posts added successfully!"
  //   );

  //   await DatabaseService.updateImageSyncStatus();
  // }
  static async addPosts(datas: Post[]): Promise<void> {
    const jwt = await getItem("jwt");
    await this.fetchWithErrorHandling(
      `${SERVER_API}/add-post`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },  
        body: JSON.stringify(datas),
      }
      
    );

    await DatabaseService.finishSyncAdd();
  }

  static async updatePosts(posts: Post[]): Promise<void> {
    const jwt = await getItem("jwt");
    await this.fetchWithErrorHandling(
      `${SERVER_API}/update`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(posts),
      }
    );

    await DatabaseService.finishSyncUpdate();
  }

  static async deletePosts(posts: Post[]): Promise<void> {
    const jwt = await getItem("jwt");
    await this.fetchWithErrorHandling(
      `${SERVER_API}/delete`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(posts),
      }
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
            await DatabaseService.updateImageCloudinaryInfo(
              image.id,
              publicId,
              cloudinaryUrl,
            );

            syncedImages.push({
              ...image,
              public_id: publicId,
              cloudinary_url: cloudinaryUrl,
            });
          } else {
            syncedImages.push(image);
          }
        } else {
          syncedImages.push(image);
        }
      }

      return syncedImages;
    } catch (error) { 
      Alert.alert("Sync Error", "Failed to sync images");
      throw error;
    }
  }
}

export default SyncDbService;