import { Alert } from "react-native";
import { IconPath } from "../../assets/icon/icon";
import DatabaseService from "./database_service";

const SERVER_API = 'http://localhost:5004/api/posts';

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

    static async getPosts(): Promise<void> {
        try {
            const response = await fetch(`${SERVER_API}/get`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const posts = await response.json();
            DatabaseService.addSyncPosts(posts);
            console.log("Fetched posts:", posts);
        } catch (error) {
            console.error("Error fetching posts:", error);
            throw error;
        }
    }

    static async addPosts(posts: Post[]): Promise<void> {
        await this.fetchWithErrorHandling(
            `${SERVER_API}/add`, 
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(posts)
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
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(posts)
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
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(posts)
            },
            () => {
                DatabaseService.finishSyncDelete();
                alert("Posts deleted successfully!");
            }
        );
    }
}

export default SyncDbService;