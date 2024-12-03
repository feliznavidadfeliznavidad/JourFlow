import { IconPath } from "../../assets/icon/icon";

const SERVER_API = 'http://localhost:5004/api/posts'

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

const SyncDbService = {
    getPosts: async () => {
        try {
            const response = await fetch(SERVER_API).then(res => res.json()).then((json) => console.log(json));
            return response;
        }
        catch (error) {
            console.error("Error fetching posts:", error);
            throw error;
        }
    },
    addPost: async (posts : Post[]) => {
        try {
            const response = await fetch(SERVER_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(posts)
            }).then(res => res.json()).then((json) => console.log(json));
            return response;
        }
        catch (error) {
            console.error("Error adding post:", error);
            throw error;
        }
    },
    uppdatePost: async (post : Post) => {
        try {
            const response = await fetch(SERVER_API, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(post)
            }).then(res => res.json()).then((json) => console.log(json));
            return response;
        }
        catch (error) {
            console.error("Error updating post:", error);
            throw error;
        }
    },
    deletePost: async (id : string) => {
        try {
            const response = await fetch(SERVER_API, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            }).then(res => res.json()).then((json) => console.log(json));
            return response;
        }
        catch (error) {
            console.error("Error deleting post:", error);
            throw error;
        }
    }
};

export default SyncDbService