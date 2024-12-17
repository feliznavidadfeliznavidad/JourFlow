import * as SQLite from "expo-sqlite";
import { IconPath } from "../../assets/icon/icon";
import uuid from "react-native-uuid";
import post_status from "../../assets/post_status";
import { getItem } from "./async_storage";
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

interface User {
  id: string;
  username: string;
  jwt: string;
  google_access_token: string;
  refresh_token: string;
  email: string;
  avt_url: string;
}

interface Image {
  id: string;
  post_id: string;
  url: string;
  public_id: string;
  cloudinary_url: string;
  sync_status: number;
}

type ImageUpdate = {
  url: string;
  public_id?: string;
  cloudinary_url?: string;
};

interface UserInfo {
  username: string;
  email: string;
  avt_url: string;
}

const randomUUID = () => {
  return uuid.v4();
};

const DatabaseService = {
  db: SQLite.openDatabaseSync("JourFlow"),

  async init() {
    try {
      await this.db.execAsync(`
        PRAGMA foreign_keys = ON;   
        
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT NULL,
          jwt TEXT NOT NULL,
          google_access_token TEXT NOT NULL,
          refresh_token TEXT NOT NULL,
          email TEXT NULL,
          avt_url TEXT NOT NULL DEFAULT 'https://s3v2.interdata.vn:9000/s3-586-15343-storage/dienthoaigiakho/wp-content/uploads/2024/01/16101418/trend-avatar-vo-danh-14.jpg'
        );
        
        CREATE TABLE IF NOT EXISTS posts (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          title TEXT NOT NULL,
          icon_path TEXT NOT NULL,
          content TEXT NOT NULL,
          post_date TEXT NOT NULL,
          update_date TEXT NOT NULL,
          sync_status INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS images (
          id TEXT PRIMARY KEY,
          post_id TEXT,
          url TEXT NULL,
          public_id TEXT NULL,
          cloudinary_url TEXT NULL,
          sync_status INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE
        );
      `);
    } catch (error) {
      throw error;
    }
  },

  async insertDynamicUser(
    userId: string,
    userName: string,
    jwt: string,
    ggAccessToken: string,
    refreshJWTToken: string,
    email: string,
    avt_url: string
  ) {
    try {
      await this.db.execAsync(`
        INSERT INTO users (id ,username, jwt, google_access_token, refresh_token , email, avt_url)
        VALUES ('${userId}','${userName}','${jwt}','${ggAccessToken}','${refreshJWTToken}','${email}','${avt_url}')
      `);
    } catch (error) {
      throw error;
    }
  },

  async insertFakeUser() {
    try {
      await this.db.execAsync(`
        INSERT INTO users (username, jwt, google_access_token, refresh_token) 
        VALUES 
          ('Nicole', 'jwt ne', 'gg access token', 'refresh token'),
          ('Benjamin', 'jwt ne', 'gg access token', 'refresh token'),
          ('David', 'jwt ne', 'gg access token', 'refresh token')
      `);
    } catch (error) {
      throw error;
    }
  },

  async insertFakePost() {
    try {
      await this.db.execAsync(`
        INSERT INTO posts (id, user_id, title, icon_path, content, post_date, update_date) 
        VALUES 
          ('${randomUUID()}', 1, 'Exploring the City', 'angry', 'This post is about the best spots in the city for sightseeing.', '2024-10-10T04:52:54.843Z', '2024-10-10T04:52:54.843Z'),
          ('${randomUUID()}', 1, 'Cooking Tips', 'angry', 'A guide to the most common cooking mistakes and how to avoid them.', '2024-10-12T04:52:54.843Z', '2024-10-12T04:52:54.843Z'),
          ('${randomUUID()}', 1, 'Tech Trends', 'angry', 'Here are the latest trends in technology you should watch for in 2025.', '2024-11-10T04:52:54.843Z', '2024-11-10T04:52:54.843Z'),
          ('${randomUUID()}', 1, 'Travel Essentials', 'angry', 'What to pack when traveling abroad to ensure a smooth trip.', '2024-11-12T04:52:54.843Z', '2024-11-12T04:52:54.843Z')
      `);
    } catch (error) {
      throw error;
    }
  },

  async createPost(post: {
    title: string;
    content: string;
    icon_path: string;
    post_date: string;
    images?: Array<{
      url: string;
      public_id?: string;
      cloudinary_url?: string;
    }>;
  }): Promise<string> {
    try {
      const post_id = randomUUID();
      const currentUserId = await getItem("userId");
      await this.db.runAsync(
        `INSERT INTO posts (id, user_id, title, icon_path, content, post_date, update_date)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          post_id,
          currentUserId,
          post.title,
          post.icon_path,
          post.content,
          post.post_date,
          post.post_date,
        ]
      );

      if (post.images && post.images!.length > 0) {
        const imageValues = post.images
          .map(
            (img) =>
              `('${randomUUID()}', '${post_id}', '${img.url}', '${
                img.public_id || ""
              }', '${img.cloudinary_url || ""}')`
          )
          .join(",");
        await this.db.execAsync(
          `INSERT INTO images (id, post_id, url, public_id, cloudinary_url) VALUES ${imageValues}`
        );
      }

      return post_id;
    } catch (error) {
      throw error;
    }
  },

  async getAllImages(): Promise<Image[]> {
    try {
      const currentUserId = await getItem("userId");
      return await this.db.getAllAsync<Image>(
        "SELECT * FROM images join posts on images.post_id = posts.id Where posts.user_id = ? AND posts.sync_status != ?",
        [currentUserId, post_status.deleted]
      );
    } catch (error) {
      throw error;
    }
  },

  async updateImageCloudinaryInfo(
    imageId: string,
    publicId: string,
    cloudinaryUrl: string
  ): Promise<void> {
    try {
      await this.db.runAsync(
        `UPDATE images 
         SET public_id = ?, cloudinary_url = ?
         WHERE id = ?`,
        [publicId, cloudinaryUrl, imageId]
      );
    } catch (error) {
      throw error;
    }
  },
  async getPosts(): Promise<Post[]> {
    try {
      const currentUserId = await getItem("userId");
      const posts = await this.db.getAllAsync<any>(
        `
        SELECT * FROM posts WHERE posts.user_id = ? AND sync_status != ?
      `,
        [currentUserId, post_status.deleted]
      );

      return posts;
    } catch (error) {
      throw error;
    }
  },

  async getPostsByDate(date: Date): Promise<Post[]> {
    const formattedDate = date.toISOString().split("T")[0];
    try {
      const currentUserId = await getItem("userId");
      const posts = await this.db.getAllAsync<any>(
        `
        SELECT * FROM posts WHERE posts.user_id = ? AND DATE(post_date) = ? AND sync_status != ?
      `,
        [currentUserId, formattedDate, post_status.deleted]
      );
      return posts;
    } catch (error) {
      throw error;
    }
  },

  async getUsers(): Promise<User[]> {
    try {
      const users = await this.db.getAllAsync<any>(`
        SELECT * FROM users
      `);
      return users;
    } catch (error) {
      throw error;
    }
  },
  async getCurrentUserInfo(): Promise<UserInfo> {
    try {
      const currentUserId = await getItem("userId");
      const user = await this.db.getFirstAsync<UserInfo>(
        `
        SELECT username, email, avt_url FROM users WHERE id = ?
      `,
        [currentUserId]
      );
      return user!;
    } catch (error) {
      throw error;
    }
  },

  async checkExistingUser(id: string): Promise<Boolean> {
    try {
      const user = await this.db.getFirstAsync<Boolean>(
        `
        SELECT id FROM users WHERE id = ?
      `,
        [id]
      );
      if (user) return true;
      return false;
    } catch (error) {
      throw error;
    }
  },

  async getPostImages(postId: string): Promise<Image[]> {
    try {
      const currentUserId = await getItem("userId");
      const images = await this.db.getAllAsync<Image>(
        `SELECT * FROM images join posts on images.post_id = posts.id WHERE posts.user_id = ? AND images.post_id = ? AND posts.sync_status != ?`,
        [currentUserId, postId, post_status.deleted]
      );
      return images;
    } catch (error) {
      throw error;
    }
  },

  async updateJWT(jwt: string, id: string) {
    try {
      await this.db.runAsync("UPDATE users SET jwt = ? WHERE id = ? ", [
        jwt,
        id,
      ]);
    } catch (error) {
      throw error;
    }
  },

  async updatePost(
    postId: string,
    updates: {
      title?: string;
      content?: string;
      images?: ImageUpdate[];
    }
  ): Promise<void> {
    try {
      const { title, content, images } = updates;
      const currentUserId = await getItem("userId");
      const updateDate = new Date().toISOString();

      const currentPostStatus = await this.db.getFirstAsync<{
        sync_status: number;
      }>(`SELECT sync_status FROM posts WHERE id = ? and user_id = ?`, [postId, currentUserId]);

      const updateFields = [];
      const params = [];

      if (title !== undefined) {
        updateFields.push("title = ?");
        params.push(title);
      }
      if (content !== undefined) {
        updateFields.push("content = ?");
        params.push(content);
      }
      updateFields.push("update_date = ?");
      params.push(updateDate);

      updateFields.push("sync_status = ?");
      if (
        currentPostStatus?.sync_status === post_status.synced ||
        currentPostStatus?.sync_status === post_status.new_update
      ) {
        params.push(post_status.new_update);
      } else {
        params.push(post_status.not_sync);
      }

      if (updateFields.length > 0) {
        params.push(postId);
        await this.db.runAsync(
          `UPDATE posts SET ${updateFields.join(", ")} WHERE id = ? and user_id = ?`,
          ...params,currentUserId
        );
      }

      if (images !== undefined) {
        await this.db.runAsync("DELETE FROM images WHERE post_id = ?", [
          postId,
        ]);
        if (images.length > 0) {
          const imageValues = images
            .map(
              (img) =>
                `('${randomUUID()}', '${postId}', '${img.url}', '${
                  img.public_id || ""
                }', '${img.cloudinary_url || ""}')`
            )
            .join(",");
          await this.db.execAsync(
            `INSERT INTO images (id, post_id, url, public_id, cloudinary_url, sync_status) 
             VALUES ${imageValues}`
          );
        }
      }
    } catch (error) {
      throw error;
    }
  },

  async softDeletePost(postId: string): Promise<void> {
    try {
      await this.db.runAsync("UPDATE posts SET sync_status = ? WHERE id = ? AND sync_status != ?", [
        post_status.deleted,
        postId,
        post_status.not_sync,
      ]);
    } catch (error) {
      throw error;
    }
  },

  async hasPostsOnDate(date: Date): Promise<boolean> {
    const formattedDate = date.toISOString().split("T")[0];
    try {
      const currentUserId = await getItem("userId");
      const result = await this.db.getAllAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM posts WHERE posts.user_id = ? AND DATE(post_date) = ? AND sync_status != ?`,
        [currentUserId, formattedDate, post_status.deleted]
      );
      return result[0]?.count > 0;
    } catch (error) {
      throw error;
    }
  },

  async finishSyncUpdate(): Promise<void> {
    try {
      const currentUserId = await getItem("userId");
      await this.db.runAsync(
        "UPDATE posts SET sync_status = ? WHERE sync_status = ? and user_id = ?",
        [post_status.synced, post_status.new_update, currentUserId]
      );
    } catch (error) {
      throw error;
    }
  },

  async finishSyncAdd(): Promise<void> {
    try {
      const currentUserId = await getItem("userId");
      await this.db.runAsync(
        "UPDATE posts SET sync_status = ? WHERE sync_status = ? and user_id = ?",
        [post_status.synced, post_status.not_sync, currentUserId]
      );
    } catch (error) {
      throw error;
    }
  },

  async finishSyncDelete(): Promise<void> {
    try {
      const currentUserId = await getItem("userId");
      await this.db.runAsync("DELETE FROM posts WHERE sync_status = ? and user_id = ?", [
        post_status.deleted,currentUserId
      ]);
    } catch (error) {
      throw error;
    }
  },

  async getNotSyncPosts(): Promise<Post[]> {
    try {
      const currentUserId = await getItem("userId");
      return await this.db.getAllAsync<Post>(
        "SELECT * FROM posts WHERE posts.user_id = ? AND sync_status = ?",
        [currentUserId, post_status.not_sync]
      );
    } catch (error) {
      throw error;
    }
  },
  async getNotSyncImages(): Promise<Image[]> {
    try {
      const currentUserId = await getItem("userId");
      return await this.db.getAllAsync<Image>(
        "SELECT images.id , post_id, url, public_id, cloudinary_url, images.sync_status FROM images join posts on images.post_id = posts.id WHERE posts.user_id = ? AND images.sync_status = ?",
        [currentUserId, post_status.not_sync]
      );
    } catch (error) {
      throw error;
    }
  },

  async syncDatas(posts: Post[], images: Image[]): Promise<void> {
    try {
      const currentUserId = await getItem("userId");

      // Bắt đầu transaction
      await this.db.runAsync("BEGIN TRANSACTION");

      for (const post of posts) {
        // Kiểm tra xem post.id có tồn tại trong cơ sở dữ liệu không
        const existingPost = await this.db.getFirstAsync<string>(
          `SELECT id FROM posts WHERE posts.user_id = ? AND id = ?`,
          [currentUserId, post.id]
        );

        if (existingPost == null) {
          await this.db.runAsync(
            `INSERT INTO posts (id, user_id, title, icon_path, content, post_date, update_date, sync_status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              post.id,
              post.user_id,
              post.title,
              post.icon_path,
              post.content,
              post.post_date,
              post.update_date,
              post.sync_status,
            ]
          );
          alert("Post added successfully");
        }
      }
      for (const image of images) {
        const existingImage = await this.db.getFirstAsync<string>(
          `SELECT images.id FROM images JOIN posts ON images.post_id = posts.id WHERE posts.user_id = ? AND images.id = ?`,
          [currentUserId, image.id]
        );
        if (existingImage == null) {
          await this.db.runAsync(
            `INSERT INTO images (id, post_id, url, public_id, cloudinary_url, sync_status) VALUES (?, ?, ?, ?, ?, ?)`,
            [
              image.id,
              image.post_id,
              image.url,
              image.public_id,
              image.cloudinary_url,
              image.sync_status,
            ]
          );
          alert("Image added successfully");
        }
      }

      // Commit transaction nếu tất cả các thao tác thành công
      await this.db.runAsync("COMMIT");
    } catch (error) {
      await this.db.runAsync("ROLLBACK");

      throw error;
    }
  },

  async getUpdatedPosts(): Promise<Post[]> {
    try {
      const currentUserId = await getItem("userId");
      return await this.db.getAllAsync<Post>(
        "SELECT id, sync_status, title, content, icon_path, update_date FROM posts WHERE posts.user_id = ? AND sync_status = ?",
        [currentUserId, post_status.new_update]
      );
    } catch (error) {
      throw error;
    }
  },

  async getDeletePosts(): Promise<Post[]> {
    try {
      const currentUserId = await getItem("userId");
      return await this.db.getAllAsync<Post>(
        "SELECT * FROM posts WHERE posts.user_id = ? AND sync_status = ?",
        [currentUserId, post_status.deleted]
      );
    } catch (error) {
      throw error;  
    }
  },

  async clearDatabase(): Promise<void> {
    try {
      await this.db.execAsync(`
        DROP TABLE IF EXISTS images;
        DROP TABLE IF EXISTS posts;
        DROP TABLE IF EXISTS users;
      `);
      await this.init();
    } catch (error) {
      throw error;
    }
  },  

  async updateImageSyncStatus(): Promise<void> {
    try {
      const currentUserId = await getItem("userId");
      await this.db.runAsync(
        "UPDATE images SET sync_status = ? WHERE sync_status = ? AND post_id IN ( SELECT id FROM posts WHERE user_id = ?);" ,
        [post_status.synced, post_status.not_sync, currentUserId]
      );
    } catch (error) {
      throw error;
    }
  },
};

export default DatabaseService;
