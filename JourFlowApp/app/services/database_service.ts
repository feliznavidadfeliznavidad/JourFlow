import * as SQLite from "expo-sqlite";
import { IconPath } from "../../assets/icon/icon";
import uuid from 'react-native-uuid';

interface Post {
  id: string;
  user_id: number;
  title: string;
  icon_path: IconPath;
  content: string;
  post_date: string;
  update_date: string;
}

interface User {
  id: number;
  username: string;
  jwt: string;
  google_access_token: string;
  refresh_token: string;
}

interface Image {
  id: number;
  post_id: string;
  url: string;
}

const randomUUID = () => {
  return uuid.v4()
}


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
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS images (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          post_id TEXT,
          url TEXT NULL,
          FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE
        );
      `);
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Database initialization error:", error);
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

  async insertUser(user: Omit<User, 'id'>): Promise<number> {
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
    images?: string[];
  }): Promise<string> {
    try {
      const { title, content, icon_path, user_id, post_date, images = [] } = post;

      const post_id = randomUUID();

      await this.db.runAsync(
        `INSERT INTO posts (id, user_id, title, icon_path, content, post_date, update_date)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [post_id, user_id, title, icon_path, content, post_date, post_date]
      );

      if (images.length > 0) {
        const imageValues = images.map(url => `('${post_id}', '${url}')`).join(',');
        await this.db.execAsync(
          `INSERT INTO images (post_id, url) VALUES ${imageValues}`
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
      return await this.db.getAllAsync<Image>("SELECT * FROM images");

    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  },

  async getPosts(): Promise<Post[]> {
    try {
      const posts = await this.db.getAllAsync<any>(`
        SELECT 
          id,
          user_id,
          title,
          icon_path,
          content,
          post_date,
          update_date
        FROM posts
      `);

      return posts;
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw error;
    }
  },

  async getPostsByDate(date: Date): Promise<Post[]> {
    const formattedDate = date.toISOString().split('T')[0];
    try {
      const posts = await this.db.getAllAsync<any>(`
        SELECT 
          id,
          user_id,
          title,
          icon_path,
          content,
          post_date,
          update_date
        FROM posts 
        WHERE DATE(post_date) = ?
      `, [formattedDate]);
      return posts;
    } catch (error) {
      console.error("Error fetching posts by date:", error);
      throw error;
    }
  },

  async getUsers(): Promise<User[]> {
    try {
      const users = await this.db.getAllAsync<any>(`
        SELECT 
          id,
          username,
          jwt,
          google_access_token,
          refresh_token
        FROM users
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
        `SELECT * FROM images WHERE post_id = ?`,
        [postId]
      );
      console.log("Images from DB " + JSON.stringify(images));
      return images;
    } catch (error) {
      console.error("Error fetching images by postId:", error);
      throw error;
    }
  },

  async updatePost(
    postId: string,
    updates: {
      title?: string;
      content?: string;
      images?: string[];
    }
  ): Promise<void> {
    try {
      const { title, content, images } = updates;

      const updateDate = new Date().toISOString();

      const updateFields = [];
      const params = [];
      
      if (title !== undefined) {
        updateFields.push('title = ?');
        params.push(title);
      }
      if (content !== undefined) {
        updateFields.push('content = ?');
        params.push(content);
      }
      updateFields.push('update_date = ?');
      params.push(updateDate);
      
      if (updateFields.length > 0) {
        params.push(postId);
        await this.db.runAsync(
          `UPDATE posts SET ${updateFields.join(', ')} WHERE id = ?`,
          params
        );
      }

      if (images !== undefined) {
        await this.db.runAsync('DELETE FROM images WHERE post_id = ?', [postId]);
        if (images.length > 0) {
          const imageValues = images.map(url => `('${postId}', '${url}')`).join(',');
          await this.db.execAsync(
            `INSERT INTO images (post_id, url) VALUES ${imageValues}`
          );
        }
      }
    } catch (error) {
      console.error("Error in updatePost:", error);
      throw error;
    }
  },

  async deletePost(postId: string): Promise<void> {
    try {
      await this.db.runAsync('DELETE FROM posts WHERE id = ?', [postId]);
    } catch (error) {
      console.error("Error in deletePost:", error);
      throw error;
    }
  },

  async hasPostsOnDate(date: Date): Promise<boolean> {
    const formattedDate = date.toISOString().split('T')[0];
    try {
      const result = await this.db.getAllAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM posts WHERE DATE(post_date) = ?`,
        [formattedDate]
      );
      return result[0]?.count > 0;
    } catch (error) {
      console.error("Error checking posts existence:", error);
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
  }
};

export default DatabaseService;