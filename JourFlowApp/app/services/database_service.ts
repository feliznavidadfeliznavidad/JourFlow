import * as SQLite from "expo-sqlite";
import { IconPath } from "../../assets/icon/icon";
import { DateData } from "react-native-calendars";
import { format } from "date-fns";

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
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userName TEXT NULL,
          JWT TEXT NOT NULL,
          ggAccessToken TEXT NOT NULL,
          refreshJWTToken TEXT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS Posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER,
          Title TEXT NOT NULL,
          IconPath TEXT NOT NULL,
          Content TEXT NOT NULL,
          PostDate TEXT NOT NULL,
          UpdateDate TEXT NOT NULL,
          FOREIGN KEY(userId) REFERENCES User(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS IMGs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          postId INTEGER,
          url TEXT NULL,
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
          (1, 'Exploring the City', 'angry', 'This post is about the best spots in the city for sightseeing.', '2024-10-10T00:00:00.000Z', '2024-10-10T00:00:00.000Z'),
          (1, 'Cooking Tips', 'angry', 'A guide to the most common cooking mistakes and how to avoid them.', '2024-10-12T00:00:00.000Z', '2024-10-12T00:00:00.000Z'),
          (1, 'Tech Trends', 'angry', 'Here are the latest trends in technology you should watch for in 2025.', '2024-11-10T00:00:00.000Z', '2024-11-10T00:00:00.000Z'),
          (1, 'Travel Essentials', 'angry', 'What to pack when traveling abroad to ensure a smooth trip.', '2024-11-12T00:00:00.000Z', '2024-11-12T00:00:00.000Z')
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
    const formattedDate = date.toISOString();
    try {
      const result = await this.db.getAllAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM Posts WHERE PostDate = ?`,
        [formattedDate]
      );
      const count = result[0]?.count;
      return count > 0;
    } catch (error) {
      console.error("Error checking date existence:", error);
      throw error;
    }
  }
};

export default DatabaseService;