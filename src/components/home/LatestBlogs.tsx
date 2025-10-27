import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { blogService } from '@/services/blogService';
import { toast } from 'sonner';
import { 
  Calendar, 
  User, 
  ArrowRight, 
  Clock, 
  Sparkles
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  snippet: string;
  imageUrl?: string;
  date: any;
  author: string;
  category?: string;
  readTime?: number;
}

interface LatestBlogsProps {
  maxPosts?: number;
  showViewAll?: boolean;
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=75';

const BlogCard = ({
  post,
  index,
  formatDate,
}: {
  post: BlogPost;
  index: number;
  formatDate: (date: any) => string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.05 }}
    viewport={{ once: true, margin: "-30px" }}
    whileHover={{ y: -4 }}
    className="h-full group"
  >
    <Link href={`/blogs/${post.id}`}>
      <div className="relative bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-white/50 h-full flex flex-col">
        
        {/* Image Section - Optimized aspect ratio for mobile */}
        <div className="relative w-full aspect-[4/3] sm:aspect-video">
          <Image
            src={post.imageUrl || DEFAULT_IMAGE}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            loading={index < 4 ? "eager" : "lazy"}
            quality={75}
            unoptimized
          />
          
          {/* Gradient Overlay - Only on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Category Badge */}
          {post.category && (
            <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-[10px] md:text-xs font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-md md:rounded-lg shadow-lg z-10">
              {post.category}
            </div>
          )}
        </div>

        {/* Content Section - Compact on mobile */}
        <div className="p-3 md:p-4 lg:p-5 flex flex-col flex-grow">
          {/* Meta Info */}
          <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-600 mb-2">
            <div className="flex items-center gap-0.5 md:gap-1">
              <User className="h-2.5 w-2.5 md:h-3 md:w-3 flex-shrink-0" />
              <span className="font-medium truncate max-w-[80px] sm:max-w-none">{post.author}</span>
            </div>
            <span className="text-gray-400">•</span>
            <div className="flex items-center gap-0.5 md:gap-1">
              <Calendar className="h-2.5 w-2.5 md:h-3 md:w-3 flex-shrink-0" />
              <span className="whitespace-nowrap">{formatDate(post.date)}</span>
            </div>
          </div>

          {/* Title - Improved readability with better line clamping */}
          <h3 className="font-bold text-sm sm:text-base md:text-lg text-gray-900 mb-1.5 md:mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-pink-600 transition-all leading-tight">
            {post.title}
          </h3>

          {/* Snippet - Hidden on mobile, visible on sm+ */}
          <p className="hidden sm:block text-xs md:text-sm text-gray-600 line-clamp-2 leading-relaxed mb-2 md:mb-3 flex-grow">
            {post.snippet}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 md:pt-2.5 border-t border-gray-100 mt-auto">
            <div className="flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full">
              <Clock className="h-2.5 w-2.5 md:h-3 md:w-3" />
              <span>{post.readTime || 5} min</span>
            </div>
            
            <div className="text-orange-600 font-semibold text-xs md:text-sm flex items-center gap-1 group-hover:gap-1.5 transition-all">
              <span className="hidden xs:inline">Read</span>
              <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
);

export function LatestBlogs({ 
  maxPosts = 6,
  showViewAll = true
}: LatestBlogsProps) {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const formatDate = useCallback((date: any): string => {
    if (!date) return 'N/A';
    
    try {
      let dateObj: Date;
      
      if (date.toDate && typeof date.toDate === 'function') {
        dateObj = date.toDate();
      } else if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'string' || typeof date === 'number') {
        dateObj = new Date(date);
      } else {
        return 'N/A';
      }
      
      if (!dateObj || isNaN(dateObj.getTime())) return 'N/A';
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[dateObj.getMonth()];
      const day = dateObj.getDate();
      const year = dateObj.getFullYear();
      
      return `${month} ${day}, ${year}`;
    } catch {
      return 'N/A';
    }
  }, []);

  useEffect(() => {
    const fetchLatestBlogs = async () => {
      try {
        const posts = await blogService.getLatestPosts(maxPosts);
        setBlogPosts(posts);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        toast.error('Unable to load blog posts');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLatestBlogs();
  }, [maxPosts]);

  if (loading) {
    return (
      <section className="py-8 md:py-12 lg:py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="container mx-auto px-4 text-center">
          <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-orange-500 border-t-transparent rounded-full mx-auto animate-spin" />
        </div>
      </section>
    );
  }

  if (!blogPosts.length) {
    return (
      <section className="py-8 md:py-12 lg:py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 text-sm md:text-base mb-4">No blog posts available</p>
          <Link href="/blogs">
            <button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-5 py-2 md:px-6 md:py-2.5 rounded-lg font-semibold text-sm transition-all">
              Browse All Articles
            </button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 md:py-12 lg:py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative overflow-hidden">
      
      {/* Background Elements - Optimized for mobile */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <motion.div
          animate={{ 
            x: [0, 30, 0],
            y: [0, -30, 0],
            rotate: [0, 45, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 md:top-20 right-5 md:right-10 w-48 h-48 md:w-64 md:h-64 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, -30, 0],
            y: [0, 30, 0],
            rotate: [0, -45, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 md:bottom-20 left-5 md:left-10 w-48 h-48 md:w-64 md:h-64 bg-gradient-to-r from-orange-200/30 to-yellow-200/30 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* Header - Compact on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-6 md:mb-8 lg:mb-12"
        >
          <motion.div
            className="inline-flex items-center gap-1.5 md:gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-2.5 py-1 md:px-3 md:py-1.5 rounded-full font-semibold text-[10px] md:text-xs mb-2 md:mb-3 shadow-lg"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="h-3 w-3 md:h-3.5 md:w-3.5" />
            Latest Articles
          </motion.div>
          
          <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-1 md:mb-2">
            <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              Latest Insights
            </span>
          </h2>
          
          <p className="text-gray-600 text-xs md:text-sm lg:text-base max-w-2xl mx-auto px-4">
            Expert tips, guides, and updates on solar energy
          </p>
        </motion.div>
        
        {/* Blog Grid - 2 columns on mobile, adaptive based on post count */}
        <div className={`grid gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8 lg:mb-12 ${
          blogPosts.length === 1 
            ? 'grid-cols-1 max-w-md mx-auto' 
            : blogPosts.length === 2 
            ? 'grid-cols-2 max-w-3xl mx-auto' 
            : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-3'
        }`}>
          {blogPosts.map((post, index) => (
            <BlogCard
              key={post.id}
              post={post}
              index={index}
              formatDate={formatDate}
            />
          ))}
        </div>
        
        {/* View All Button - Optimized for mobile */}
        {showViewAll && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link href="/blogs">
              <motion.button
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-5 py-2.5 md:px-8 md:py-3.5 rounded-xl font-bold text-sm md:text-base shadow-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="hidden sm:inline">View All Articles</span>
                <span className="sm:hidden">View All</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                </motion.div>
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default LatestBlogs;