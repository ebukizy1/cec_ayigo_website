import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc, query, orderBy, limit, updateDoc, serverTimestamp } from "firebase/firestore";

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  snippet: string;
  imageUrl: string;
  author: string;
  date: Date;
  tags: string[];
}

export const blogService = {
  async getLatestPosts(limitCount = 3): Promise<BlogPost[]> {
    try {
      const res = await fetch(`/api/blogs/latest?limit=${encodeURIComponent(String(limitCount))}`);
      if (res.ok) {
        const json = await res.json() as { posts: any[] };
        if (Array.isArray(json.posts)) return json.posts as unknown as BlogPost[];
      }
    } catch (error) {
      console.error("Error fetching latest blog posts:", error);
    }
    try {
      const postsQuery = query(collection(db, "blogPosts"), orderBy("date", "desc"), limit(limitCount));
      const snapshot = await getDocs(postsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BlogPost[];
    } catch (error) {
      console.error("Error fetching latest blog posts:", error);
      return [];
    }
  },
  
  async getPostById(id: string): Promise<BlogPost | null> {
    try {
      const res = await fetch(`/api/blogs/${encodeURIComponent(id)}`);
      if (res.ok) {
        const json = await res.json() as { post?: any };
        if (json.post) return json.post as unknown as BlogPost;
      }
    } catch (error) {
      console.error(`Error fetching blog post with ID ${id}:`, error);
    }
    try {
      const postDoc = await getDoc(doc(db, "blogPosts", id));
      if (!postDoc.exists()) return null;
      return { id: postDoc.id, ...postDoc.data() } as BlogPost;
    } catch (error) {
      console.error(`Error fetching blog post with ID ${id}:`, error);
      return null;
    }
  },
  
  async updateBlogPost(id: string, blogData: Partial<Omit<BlogPost, 'id' | 'date'>>): Promise<void> {
    try {
      const blogRef = doc(db, 'blogPosts', id);
      await updateDoc(blogRef, {
        ...blogData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating blog post:', error);
      throw error;
    }
  },

  async getAllPosts(): Promise<BlogPost[]> {
    try {
      const res = await fetch(`/api/blogs`);
      if (res.ok) {
        const json = await res.json() as { posts: any[] };
        if (Array.isArray(json.posts)) return json.posts as unknown as BlogPost[];
      }
    } catch (error) {
      console.error('Error fetching all blog posts:', error);
    }
    try {
      const postsQuery = query(collection(db, 'blogPosts'), orderBy('date', 'desc'));
      const snapshot = await getDocs(postsQuery);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          content: data.content,
          snippet: data.snippet,
          imageUrl: data.imageUrl,
          author: data.author,
          date: data.date,
          tags: data.tags || []
        };
      }) as BlogPost[];
    } catch (error) {
      console.error('Error fetching all blog posts:', error);
      return [];
    }
  }
};
