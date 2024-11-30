import { IconPath } from "../../assets/icon/icon";

const SERVER_API = 'http://localhost:5004/api/posts'


interface Post {
    id: number;
    userId: number;
    title: string;
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

interface IMG {
  id: number;
  postId: number;
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
    addPost: async (post : Post) => {
        try {
            const response = await fetch(SERVER_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(post)
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
    deletePost: async (id : number) => {
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