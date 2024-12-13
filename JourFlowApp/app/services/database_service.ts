import * as SQLite from "expo-sqlite";
import { IconPath } from "../../assets/icon/icon";
import uuid from "react-native-uuid";
import post_status from "../../assets/post_status";

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

interface User {
  id: number;
  username: string;
  jwt: string;
  google_access_token: string;
  refresh_token: string;
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
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NULL,
          jwt TEXT NOT NULL,
          google_access_token TEXT NOT NULL,
          refresh_token TEXT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS posts (
          id TEXT PRIMARY KEY,
          user_id INTEGER,
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
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Database initialization error:", error);
      throw error;
    }
  },

  async insertDynamicUser(
    userName: any,
    jwt: any,
    ggAccessToken: any,
    refreshJWTToken: any
  ) {
    try {
      await this.db.execAsync(`
        INSERT INTO users (username, jwt, google_access_token, refresh_token)
        VALUES ('${userName}','${jwt}','${ggAccessToken}','${refreshJWTToken}')
      `);
    } catch (error) {
      console.error("Error inserting user:", error);
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
      console.error("Error inserting user:", error);
      throw error;
    }
  },

  async insertUser(user: Omit<User, "id">): Promise<number> {
    try {
      const result = await this.db.runAsync(
        `INSERT INTO users (username, jwt, google_access_token, refresh_token) 
         VALUES (?, ?, ?, ?)`,
        [user.username, user.jwt, user.google_access_token, user.refresh_token]
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error("Error inserting user:", error);
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
      console.log("Fake posts inserted successfully");
    } catch (error) {
      console.error("Error inserting post:", error);
      throw error;
    }
  },

  async createPost(post: {
    title: string;
    content: string;
    icon_path: string;
    user_id: number;
    post_date: string;
    images?: Array<{
      url: string;
      public_id?: string;
      cloudinary_url?: string;
    }>;
  }): Promise<string> {
    try {
      const {
        title,
        content,
        icon_path,
        user_id,
        post_date,
        images = [],
      } = post;

      const post_id = randomUUID();

      await this.db.runAsync(
        `INSERT INTO posts (id, user_id, title, icon_path, content, post_date, update_date)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [post_id, user_id, title, icon_path, content, post_date, post_date]
      );

      if (images.length > 0) {
        const imageValues = images
          .map(
            (img) =>
              `('${randomUUID()}', '${post_id}', '${img.url}', '${img.public_id || ""}', '${
                img.cloudinary_url || ""
              }', 0)`
          )
          .join(",");
        await this.db.execAsync(
          `INSERT INTO images (id, post_id, url, public_id, cloudinary_url, sync_status) VALUES ${imageValues}`
        );
      }

      return post_id;
    } catch (error) {
      console.error("Error in createPost:", error);
      throw error;
    }
  },

  async getAllImages(): Promise<Image[]> {
    try {
      return await this.db.getAllAsync<Image>(
        "SELECT * FROM images join posts on images.post_id = posts.id Where posts.sync_status != ?",
        [post_status.deleted]
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  },

  async updateImageCloudinaryInfo(
    imageId: string,
    publicId: string,
    cloudinaryUrl: string,
    syncStatus: number
  ): Promise<void> {
    try {
      await this.db.runAsync(
        `UPDATE images 
         SET public_id = ?, cloudinary_url = ?, sync_status = ?
         WHERE id = ?`,
        [publicId, cloudinaryUrl, syncStatus, imageId]
      );
    } catch (error) {
      console.error("Error updating image cloudinary info:", error);
      throw error;
    }
  },

  async getUnsyncedImages(): Promise<Image[]> {
    try {
      return await this.db.getAllAsync<Image>(
        "SELECT * FROM images WHERE sync_status = 0"
      );
    } catch (error) {
      console.error("Error fetching unsynced images:", error);
      throw error;
    }
  },

  async getPosts(): Promise<Post[]> {
    try {
      const posts = await this.db.getAllAsync<any>(
        `
        SELECT * FROM posts WHERE sync_status != ?
      `,
        [post_status.deleted]
      );

      return posts;
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw error;
    }
  },

  async getPostsByDate(date: Date): Promise<Post[]> {
    const formattedDate = date.toISOString().split("T")[0];
    try {
      const posts = await this.db.getAllAsync<any>(
        `
        SELECT * FROM posts WHERE DATE(post_date) = ? AND sync_status != ?
      `,
        [formattedDate, post_status.deleted]
      );
      return posts;
    } catch (error) {
      console.error("Error fetching posts by date:", error);
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
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  async getPostImages(postId: string): Promise<Image[]> {
    try {
      const images = await this.db.getAllAsync<Image>(
        `SELECT * FROM images join posts on images.post_id = posts.id WHERE post_id = ? AND posts.sync_status != ?`,
        [postId, post_status.deleted]
      );
      console.log("Images from DB " + JSON.stringify(images));
      return images;
    } catch (error) {
      console.error("Error fetching images by postId:", error);
      throw error;
    }
  },

  async updateJWT(jwt: any, id: any) {
    console.log("UPDATE JWTTTTTTTT");
    try {
      const user = await this.db.getAllSync<any>(
        `
        SELECT * FROM users WHERE id = ?
      `,
        [id]
      );

      if (!user) {
        throw new Error(`User with ID ${id} not found`);
      }

      await this.db.execAsync(`
        UPDATE users SET jwt = '${jwt}' WHERE id = ${id}
      `);
    } catch (error) {
      console.error("Error updating JWT:", error);
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

      const updateDate = new Date().toISOString();

      const currentPostStatus = await this.db.getFirstAsync<{
        sync_status: number;
      }>(`SELECT sync_status FROM posts WHERE id = ?`, [postId]);

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
          `UPDATE posts SET ${updateFields.join(", ")} WHERE id = ?`,
          params
        );
      }

      if (images !== undefined) {
        await this.db.runAsync("DELETE FROM images WHERE post_id = ?", [postId]);
        if (images.length > 0) {
          const imageValues = images
            .map((img) => 
              `('${randomUUID()}', '${postId}', '${img.url}', '${img.public_id || ""}', '${img.cloudinary_url || ""}', 0)`
            )
            .join(",");
          await this.db.execAsync(
            `INSERT INTO images (id, post_id, url, public_id, cloudinary_url, sync_status) 
             VALUES ${imageValues}`
          );
        }
      }
    } catch (error) {
      console.error("Error in updatePost:", error);
      throw error;
    }
  },

  async softDeletePost(postId: string): Promise<void> {
    try {
      await this.db.runAsync("UPDATE posts SET sync_status = ? WHERE id = ?", [
        post_status.deleted,
        postId,
      ]);
    } catch (error) {
      console.error("Error in softDeletePost:", error);
      throw error;
    }
  },

  async hasPostsOnDate(date: Date): Promise<boolean> {
    const formattedDate = date.toISOString().split("T")[0];
    try {
      const result = await this.db.getAllAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM posts WHERE DATE(post_date) = ? AND sync_status != ?`,
        [formattedDate, post_status.deleted]
      );
      return result[0]?.count > 0;
    } catch (error) {
      console.error("Error checking posts existence:", error);
      throw error;
    }
  },

  async finishSyncUpdate(): Promise<void> {
    try {
      await this.db.runAsync(
        "UPDATE posts SET sync_status = ? WHERE sync_status = ?",
        [post_status.synced, post_status.new_update]
      );
    } catch (error) {
      console.error("Error in finishSync:", error);
      throw error;
    }
  },

  async finishSyncAdd(): Promise<void> {
    try {
      await this.db.runAsync(
        "UPDATE posts SET sync_status = ? WHERE sync_status = ?",
        [post_status.synced, post_status.not_sync]
      );
    } catch (error) {
      console.error("Error in finishSync:", error);
      throw error;
    }
  },

  async finishSyncDelete(): Promise<void> {
    try {
      await this.db.runAsync("DELETE FROM posts WHERE sync_status != ?", [
        post_status.deleted,
      ]);
    } catch (error) {
      console.error("Error in deletePost:", error);
      throw error;
    }
  },

  async getNotSyncPosts(): Promise<Post[]> {
    try {
      return await this.db.getAllAsync<Post>(
        "SELECT * FROM posts WHERE sync_status = ? or sync_status = ?",
        [post_status.not_sync]
      );
    } catch (error) {
      console.error("Error in getNotSyncPosts:", error);
      throw error;
    }
  },

  async addSyncPosts(posts: Post[]): Promise<void> {
    try {
      posts.forEach(async (post) => {
        // Kiểm tra xem post.id có tồn tại trong cơ sở dữ liệu không
        const existingPost = await this.db.getFirstAsync<string>(
          `SELECT id FROM posts WHERE id = ?`,
          [post.id]
        );

        if (!existingPost) {
          console.log("Adding post");
          await this.db.runAsync(
            `INSERT INTO posts (id, user_id, title, icon_path, content, post_date, update_date)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              post.id,
              post.user_id,
              post.title,
              post.icon_path,
              post.content,
              post.post_date,
              post.post_date,
            ]
          );
          console.log("Post added successfully");
        } else {
          console.log("Posts already exists");
        }
      });
    } catch (error) {
      console.error("Error in getNewUpdatePosts:", error);
      throw error;
    }
  },

  async getUpdatedPosts(): Promise<Post[]> {
    try {
      return await this.db.getAllAsync<Post>(
        "SELECT id, sync_status, title, content, icon_path, update_date FROM posts WHERE sync_status = ?",
        [post_status.new_update]
      );
    } catch (error) {
      console.error("Error in getNewUpdatePosts:", error);
      throw error;
    }
  },

  async getDeletePosts(): Promise<Post[]> {
    try {
      return await this.db.getAllAsync<Post>(
        "SELECT id, sync_status FROM posts WHERE sync_status = ?",
        [post_status.deleted]
      );
    } catch (error) {
      console.error("Error in getDeletePosts:", error);
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
      console.log("Database cleared successfully");
      await this.init();
    } catch (error) {
      console.error("Error clearing database:", error);
      throw error;
    }
  },

  async updateImageSyncStatus(imageId: string, syncStatus: number): Promise<void> {
    try {
      await this.db.runAsync(
        `UPDATE images 
         SET sync_status = ?
         WHERE id = ?`,
        [syncStatus, imageId]
      );
    } catch (error) {
      console.error("Error updating image sync status:", error);
      throw error;
    }
  },

  async syncServerImages(images: Image[]): Promise<void> {
    try {
      await this.db.runAsync(
        `DELETE FROM images WHERE sync_status = 1`
      );
      for (const image of images) {
        await this.db.runAsync(
          `INSERT OR REPLACE INTO images (
            id, post_id, url, public_id, cloudinary_url, sync_status
          ) VALUES (?, ?, ?, ?, ?, 1)`,
          [
            image.id,
            image.post_id,
            image.url,
            image.public_id,
            image.cloudinary_url
          ]
        );
      }
    } catch (error) {
      console.error("Error syncing server images:", error);
      throw error;
    }
  }
};

export default DatabaseService;