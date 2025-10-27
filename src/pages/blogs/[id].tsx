import React, { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { blogService } from '@/services/blogService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Clock, 
  Tag, 
  Share2, 
  Bookmark,
  BookmarkCheck,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  MessageCircle,
  Eye,
  ThumbsUp,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Home
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  snippet: string;
  imageUrl: string;
  date: any;
  category?: string;
  author?: string;
  readTime?: string;
  tags?: string[];
  views?: number;
  likes?: number;
}

interface RelatedPost {
  id: string;
  title: string;
  snippet: string;
  imageUrl: string;
  date: any;
  category?: string;
  readTime?: string;
}

export default function BlogPostPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchBlogPost(id);
    }
  }, [id]);

  const fetchBlogPost = async (postId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch the specific blog post
      const blogPost = await blogService.getPostById(postId);
      
      if (!blogPost) {
        setError('Blog post not found');
        return;
      }

      // Format the post data
      const formattedPost: BlogPost = {
        id: blogPost.id,
        title: blogPost.title,
        content: blogPost.content || blogPost.snippet || '',
        snippet: blogPost.snippet,
        imageUrl: blogPost.imageUrl,
        date: blogPost.date,
        category: blogPost.tags && blogPost.tags.length > 0 ? blogPost.tags[0] : 'General',
        author: blogPost.author || 'CeC Team',
        readTime: calculateReadTime(blogPost.content || blogPost.snippet || ''),
        tags: blogPost.tags || [],
        views: Math.floor(Math.random() * 1000) + 100, // Mock view count
        likes: Math.floor(Math.random() * 50) + 10 // Mock like count
      };

      setPost(formattedPost);
      setLikeCount(formattedPost.likes || 0);

      // Fetch related posts
      await fetchRelatedPosts(formattedPost.category, formattedPost.tags, postId);
      
      // Increment view count (you can implement this in your backend)
      // await blogService.incrementViews(postId);
      
    } catch (error) {
      console.error('Error fetching blog post:', error);
      setError('Failed to load blog post');
      toast.error('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async (category?: string, tags?: string[], currentPostId?: string) => {
    try {
      const allPosts = await blogService.getAllPosts();
      
      // Filter related posts based on category and tags
      const related = allPosts
        .filter(p => p.id !== currentPostId)
        .filter(p => {
          if (category && p.tags?.includes(category)) return true;
          if (tags && tags.some(tag => p.tags?.includes(tag))) return true;
          return false;
        })
        .slice(0, 3)
        .map(p => ({
          id: p.id,
          title: p.title,
          snippet: p.snippet,
          imageUrl: p.imageUrl,
          date: p.date,
          category: p.tags && p.tags.length > 0 ? p.tags[0] : 'General',
          readTime: calculateReadTime(p.content || p.snippet || '')
        }));

      setRelatedPosts(related);
    } catch (error) {
      console.error('Error fetching related posts:', error);
    }
  };

  const calculateReadTime = (content: string): string => {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
    return `${readTime} min read`;
  };

  const formatDate = (date: any): string => {
    if (!date) return 'N/A';
    try {
      if (date.toDate) {
        return format(date.toDate(), 'MMMM dd, yyyy');
      }
      return format(new Date(date), 'MMMM dd, yyyy');
    } catch {
      return 'N/A';
    }
  };

  const handleShare = async (platform?: string) => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const title = post?.title || '';
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(url);
          toast.success('Link copied to clipboard!');
        }
        break;
    }
    setShowShareMenu(false);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    // You can implement actual like functionality in your backend
    toast.success(isLiked ? 'Like removed' : 'Post liked!');
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Bookmark removed' : 'Post bookmarked!');
    // You can implement actual bookmark functionality in your backend
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
            
            {/* Image skeleton */}
            <div className="h-64 md:h-96 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8"></div>
            
            {/* Content skeleton */}
            <div className="max-w-4xl mx-auto">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-8"></div>
              
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {error || 'Blog post not found'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => router.back()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
              <Link href="/blogs">
                <Button className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Browse All Articles
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{post.title} | CeC - Shop Easy</title>
        <meta name="description" content={post.snippet} />
        <meta name="keywords" content={`${post.tags?.join(", ")}, blog, CeC`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.snippet} />
        <meta property="og:image" content={post.imageUrl} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.snippet} />
        <meta name="twitter:image" content={post.imageUrl} />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Navigation Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 backdrop-blur-sm bg-white/95 dark:bg-gray-800/95">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Blog</span>
                <span className="sm:hidden">Back</span>
              </Button>

              <div className="flex items-center gap-2">
                {/* Bookmark button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  className={`${isBookmarked ? 'text-primary' : 'text-gray-500'} hover:text-primary`}
                >
                  {isBookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                </Button>

                {/* Share button */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="text-gray-500 hover:text-primary"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>

                  <AnimatePresence>
                    {showShareMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 min-w-40 z-50"
                      >
                        <button
                          onClick={() => handleShare('twitter')}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3"
                        >
                          <Twitter className="h-4 w-4 text-blue-500" />
                          Twitter
                        </button>
                        <button
                          onClick={() => handleShare('facebook')}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3"
                        >
                          <Facebook className="h-4 w-4 text-blue-600" />
                          Facebook
                        </button>
                        <button
                          onClick={() => handleShare('linkedin')}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3"
                        >
                          <Linkedin className="h-4 w-4 text-blue-700" />
                          LinkedIn
                        </button>
                        <button
                          onClick={() => handleShare('copy')}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3"
                        >
                          <Copy className="h-4 w-4 text-gray-500" />
                          Copy Link
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>

        <article className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Hero Image */}
            <div className="relative h-64 md:h-96 lg:h-[500px] rounded-xl overflow-hidden mb-8">
              <Image
                src={post.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                alt={post.title}
                fill
                className="object-cover"
                priority
                unoptimized={true}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Category Badge */}
              {post.category && (
                <div className="absolute top-6 left-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white/95 backdrop-blur-sm text-gray-800 shadow-sm">
                    <Tag className="h-4 w-4 mr-2" />
                    {post.category}
                  </span>
                </div>
              )}

              {/* Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="text-white">
                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                    {post.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(post.date)}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {post.readTime}
                    </span>
                    {post.views && (
                      <span className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        {post.views} views
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div className="max-w-4xl mx-auto">
              {/* Article Stats */}
              <div className="flex items-center justify-between mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-6">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      isLiked 
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <ThumbsUp className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="font-medium">{likeCount}</span>
                  </button>
                  
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MessageCircle className="h-5 w-5" />
                    <span className="font-medium">Comments</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Eye className="h-4 w-4" />
                  {post.views} views
                </div>
              </div>

              {/* Article Body */}
              <div className="prose prose-lg dark:prose-invert max-w-none">
                {post.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-6 text-gray-700 dark:text-gray-300 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Tags Section */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <Link key={index} href={`/blogs?category=${encodeURIComponent(tag)}`}>
                        <span className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-primary/10 dark:hover:bg-primary/20 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary rounded-full text-sm font-medium transition-colors cursor-pointer">
                          #{tag}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Author Section */}
              <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {post.author}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      Expert writer and content creator passionate about sharing insights on technology, 
                      e-commerce, and digital trends. Always exploring new ways to help our community 
                      stay informed and make better decisions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </article>

        {/* Related Posts Section */}
        {relatedPosts.length > 0 && (
          <section className="bg-white dark:bg-gray-800 py-16">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Related Articles
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Discover more insights and stories that might interest you
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost, index) => (
                  <motion.div
                    key={relatedPost.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -4 }}
                    className="group"
                  >
                    <Link href={`/blogs/${relatedPost.id}`}>
                      <Card className="h-full overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-primary/40 transition-all duration-300">
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={relatedPost.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                            alt={relatedPost.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            unoptimized={true}
                          />
                          {relatedPost.category && (
                            <div className="absolute top-3 left-3">
                              <span className="inline-block px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold rounded-full">
                                {relatedPost.category}
                              </span>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(relatedPost.date)}
                            </span>
                            {relatedPost.readTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {relatedPost.readTime}
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white leading-tight group-hover:text-primary transition-colors line-clamp-2">
                            {relatedPost.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 leading-relaxed">
                            {relatedPost.snippet}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Link href="/blogs">
                  <Button variant="outline" className="flex items-center gap-2 mx-auto">
                    View All Articles
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Newsletter Section */}
        <section className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 py-16">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="max-w-lg mx-auto"
            >
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Never Miss an Update
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Subscribe to our newsletter and get the latest articles delivered to your inbox weekly.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/30 text-gray-900 dark:text-gray-100 placeholder-gray-500"
                />
                <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-semibold">
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                No spam, unsubscribe anytime. We respect your privacy.
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}