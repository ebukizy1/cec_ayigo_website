import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { blogService, BlogPost } from "@/services/blogService";

export default function EditBlogPost() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    snippet: "",
    imageUrl: "",
    author: "",
    tags: [] as string[],
  });

  useEffect(() => {
    let mounted = true;
    
    const loadBlogPost = async () => {
      if (!id) return;
      
      try {
        const post = await blogService.getPostById(id as string);
        if (!mounted) return;
        
        if (post) {
          setFormData({
            title: post.title,
            content: post.content,
            snippet: post.snippet,
            imageUrl: post.imageUrl,
            author: post.author,
            tags: post.tags || [],
          });
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
        if (mounted) {
          toast.error('Failed to fetch blog post');
          router.push('/admin/dashboard');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadBlogPost();
    
    return () => {
      mounted = false;
    };
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await blogService.updateBlogPost(id as string, formData);
      toast.success('Blog post updated successfully');
      router.push('/admin/dashboard');
    } catch (error) {
      console.error('Error updating blog post:', error);
      toast.error('Failed to update blog post');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Blog Post | Admin Dashboard</title>
      </Head>

      <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
        <Card>
          <CardHeader>
            <CardTitle>Edit Blog Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Content</label>
                  <Textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    rows={10}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Snippet</label>
                  <Textarea
                    name="snippet"
                    value={formData.snippet}
                    onChange={handleInputChange}
                    required
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Image URL</label>
                  <Input
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Author</label>
                  <Input
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/dashboard")}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Update Blog Post
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}