import { IconPath } from "../../assets/icon/icon";
import DatabaseService from "./database_service";

const SERVER_API = 'http://localhost:5004/api/posts'

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


const SyncDbService = {
    getPosts: async () => {
        try {
            const response = await fetch(`${SERVER_API}`).then(res => res.json()).then((json) => console.log(json));
            return response;
        }
        catch (error) {
            console.error("Error fetching posts:", error);
            throw error;
        }
    },
    addPost: async (posts : Post[]) => {
        try {
            const response = await fetch(`${SERVER_API}/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(posts)
            }).then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text(); // Hoặc response.json() nếu server trả về JSON
            })
            .then(data => {
                console.log("Server Response:", data); // "success"
                if (data === "success") {
                    DatabaseService.finishSyncAdd();
                    alert("Operation succeeded!");
                }
            })
            .catch(error => {
                console.error("Error:", error);
            });
        }
        catch (error) {
            console.error("Error adding post:", error);
            throw error;
        }
    },
    uppdatePost: async (post : Post[]) => {
        try {
            const response = await fetch(`${SERVER_API}/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(post)
            }).then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text(); // Hoặc response.json() nếu server trả về JSON
            })
            .then(data => {
                console.log("Server Response:", data); // "success"
                if (data === "success") {
                    DatabaseService.finishSyncUpdate();
                    alert("Operation succeeded!");
                }
            })
            .catch(error => {
                console.error("Error:", error);
            });
        }
        catch (error) {
            console.error("Error updating post:", error);
            throw error;
        }
    },
    deletePost: async (post : Post[]) => {
        try {
            const response = await fetch(`${SERVER_API}/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ post })
            }).then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text(); // Hoặc response.json() nếu server trả về JSON
            })
            .then(data => {
                console.log("Server Response:", data); // "success"
                if (data === "success") {
                    DatabaseService.finishSyncDelete();
                    alert("Operation succeeded!");
                }
            })
            .catch(error => {
                console.error("Error:", error);
            });
        }
        catch (error) {
            console.error("Error deleting post:", error);
            throw error;
        }
    }
};

export default SyncDbService