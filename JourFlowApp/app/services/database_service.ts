import * as SQLite from "expo-sqlite";
import { IconPath } from "../../assets/icon/icon";

interface Post {
  id: number;
  userId: number;
  Title: string;
  IconPath: IconPath;
  Content: string;
  PostDate: string;
  UpdateDate: string;
}

interface User {
  id: number;
  userName: string;
  JWT: string;
  ggAccessToken: string;
  refreshJWTToken: string;
}

interface Imgs {
  id: number;
  postId: number;
  url: string;
}

interface CountResult {
  count: number;
}

const DatabaseService = {
  db: SQLite.openDatabaseSync("JourFlow"),

  async init() {
    try {
      await this.db.execAsync(`
        PRAGMA foreign_keys = ON;   
        
        CREATE TABLE IF NOT EXISTS User (
          Id INTEGER PRIMARY KEY AUTOINCREMENT,
          UserName TEXT NULL,
          JWT TEXT NOT NULL,
          GgAccessToken TEXT NOT NULL,
          RefreshJWTToken TEXT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS Posts (
          Id INTEGER PRIMARY KEY AUTOINCREMENT,
          UserId INTEGER,
          Title TEXT NOT NULL,
          IconPath TEXT NOT NULL,
          Content TEXT NOT NULL,
          PostDate TEXT NOT NULL,
          UpdateDate TEXT NOT NULL,
          FOREIGN KEY(userId) REFERENCES User(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS IMGs (
          Id INTEGER PRIMARY KEY AUTOINCREMENT,
          PostId INTEGER,
          Url TEXT NULL,
          FOREIGN KEY(postId) REFERENCES Posts(id) ON DELETE CASCADE
        );
      `);
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Database initialization error:", error);
    }

  },

  async insertUser() {
    try {
      await this.db.execAsync(`
        INSERT INTO User (userName, JWT, ggAccessToken, refreshJWTToken) 
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

  async insertPost() {
    try {
      await this.db.execAsync(`
        INSERT INTO Posts (userId, Title, IconPath, Content, PostDate, UpdateDate) 
        VALUES 
          (1, 'Exploring the City', 'angry', 'This post is about the best spots in the city for sightseeing.', '2024-10-10T04:52:54.843Z', '2024-10-10T04:52:54.843Z'),
          (1, 'Cooking Tips', 'angry', 'A guide to the most common cooking mistakes and how to avoid them.', '2024-10-12T04:52:54.843Z', '2024-10-12T04:52:54.843Z'),
          (1, 'Tech Trends', 'angry', 'Here are the latest trends in technology you should watch for in 2025.', '2024-11-10T04:52:54.843Z', '2024-11-10T04:52:54.843Z'),
          (1, 'Travel Essentials', 'angry', 'What to pack when traveling abroad to ensure a smooth trip.', '2024-11-12T04:52:54.843Z', '2024-11-12T04:52:54.843Z')
      `);
    } catch (error) {
      console.error("Error inserting post:", error);
      throw error;
    }
  },

  async getPosts(): Promise<Post[]> {
    try {
      return await this.db.getAllAsync<Post>("SELECT * FROM Posts");
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw error;
    }
  },

  async getPostByDate(date: Date): Promise<Post[]> {
    const formattedDate = date.toISOString().split('T')[0]; 
    try {
      return await this.db.getAllAsync<Post>(`SELECT * FROM Posts WHERE DATE(PostDate) = ?`, [formattedDate]);
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw error;
    }
  },

  async getUsers(): Promise<User[]> {
    try {
      return await this.db.getAllAsync<User>("SELECT * FROM User");
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  async getImages(): Promise<Imgs[]> {
    try {
      return await this.db.getAllAsync<Imgs>("SELECT * FROM IMGs");
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  },

  async getImagesByPostId(postId: number): Promise<Imgs[]> {
    try {
      return await this.db.getAllAsync<Imgs>(
        `SELECT * FROM Imgs WHERE postId = ${postId}`
      );
    } catch (error) {
      console.error("Error fetching images by postId:", error);
      throw error;
    }
  },

  async createPost(
    title: string,
    content: string,
    iconPath: string,
    postDate: Date,
    savedImgPaths: string[]
  ): Promise<number> {
    try {
      const sanitizedTitle = title.replace(/'/g, "''");
      const sanitizedContent = content.replace(/'/g, "''");
      const sanitizedIconPath = iconPath.replace(/'/g, "''");

      const postResult = await this.db.runAsync(
        `INSERT INTO Posts (userId, Title, IconPath, Content, PostDate, UpdateDate)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          1, // userId mặc định
          sanitizedTitle,
          sanitizedIconPath,
          sanitizedContent,
          postDate.toISOString(),
          new Date().toISOString()
        ]
      );

      const postId = postResult.lastInsertRowId;

      if (savedImgPaths.length > 0) {
        await Promise.all(
          savedImgPaths.map(async (imgPath) => {
            await this.db.runAsync(
              `INSERT INTO IMGs (postId, url) VALUES (?, ?)`,
              [postId, imgPath]
            );
          })
        );
      }

      return postId;
    } catch (error) {
      console.error("Error in createPost:", error);
      throw error;
    }
  },

  async clearDatabase() {
    try {
      await this.db.execAsync(`
          DROP TABLE IF EXISTS IMGs;
          DROP TABLE IF EXISTS Posts;
          DROP TABLE IF EXISTS User;
        `);
      console.log("Database cleared successfully");
    } catch (error) {
      console.error("Error clearing database:", error);
      throw error;
    }
  },

  async existingDateOfPost(date: Date): Promise<boolean> {
    const formattedDate = date.toISOString().split('T')[0]; 
    try {
      const result = await this.db.getAllAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM Posts WHERE DATE(PostDate) = ?`,
        [formattedDate]
      );
      const count = result[0]?.count;
      return count > 0;
    } catch (error) {
      console.error("Error checking date existence:", error);
      throw error;
    }
  },

  async updatePost(postId: number, title: string, content: string, savedImgPaths: string[]): Promise<void> {
    try {
      // Update post
      await this.db.runAsync(
        `UPDATE Posts 
         SET Title = ?, Content = ?, UpdateDate = ?
         WHERE id = ?`,
        [title, content, new Date().toISOString(), postId]
      );

      // Delete existing images
      await this.db.runAsync(
        `DELETE FROM IMGs WHERE postId = ?`,
        [postId]
      );

      // Insert new images
      if (savedImgPaths.length > 0) {
        await Promise.all(
          savedImgPaths.map(async (imgPath) => {
            await this.db.runAsync(
              `INSERT INTO IMGs (postId, url) VALUES (?, ?)`,
              [postId, imgPath]
            );
          })
        );
      }
    } catch (error) {
      console.error("Error in updatePost:", error);
      throw error;
    }
  },

  async deletePost(postId: number): Promise<void> {
    try {
      // Delete images first (foreign key constraint will handle this automatically,
      // but we're keeping it explicit for clarity)
      await this.db.runAsync(
        `DELETE FROM IMGs WHERE postId = ?`,
        [postId]
      );

      // Delete post
      await this.db.runAsync(
        `DELETE FROM Posts WHERE id = ?`,
        [postId]
      );
    } catch (error) {
      console.error("Error in deletePost:", error);
      throw error;
    }
  }
};

export default DatabaseService;