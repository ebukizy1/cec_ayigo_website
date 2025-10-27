import React, { useEffect, useState, useMemo } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { blogService } from '@/services/blogService';
import { toast } from 'sonner';
import { 
  Search, 
  Calendar, 
  User, 
  ArrowRight, 
  Clock,
  X,
  Sparkles
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  snippet: string;
  imageUrl: string;
  date: any;
  category?: string;
  author?: string;
  readTime?: string;
  tags?: string[];
}

export default function BlogsPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    let filtered = blogPosts;

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(search) ||
        post.snippet.toLowerCase().includes(search) ||
        post.author?.toLowerCase().includes(search)
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(post => 
        post.category === selectedCategory ||
        post.tags?.includes(selectedCategory)
      );
    }

    return filtered.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [blogPosts, searchTerm, selectedCategory]);

  const fetchBlogPosts = async () => {
    try {
      const posts: any[] = await blogService.getAllPosts();
      
      const formatted: BlogPost[] = posts.map(post => ({
        id: post.id,
        title: post.title,
        snippet: post.snippet,
        imageUrl: post.imageUrl,
        date: post.date,
        category: post.tags?.[0] || 'General',
        author: post.author || 'AYIGO Team',
        readTime: calculateReadTime(post.content || post.snippet || ''),
        tags: post.tags || []
      }));
      
      setBlogPosts(formatted);
      
      const allCategories = new Set<string>(['All']);
      formatted.forEach(post => {
        if (post.category) allCategories.add(post.category);
        post.tags?.forEach(tag => allCategories.add(tag));
      });
      
      setCategories(Array.from(allCategories));
      
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const calculateReadTime = (content: string): string => {
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min`;
  };

  const formatDate = (date: any): string => {
    if (!date) return 'N/A';
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-blue-50 to-purple-100'>
        <div className='text-center'>
          <motion.div 
            className='w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4'
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className='text-gray-700 font-bold text-lg'>Loading articles...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Blog | AYIGO - Latest Articles & Insights</title>
        <meta name='description' content='Discover the latest articles and insights from AYIGO.' />
      </Head>

      <div className='min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-100 relative overflow-hidden'>
        
        {/* Dynamic Background Elements - Matching Hero */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ 
              x: [0, 100, 0],
              y: [0, -50, 0],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-orange-200/30 to-pink-200/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              x: [0, -100, 0],
              y: [0, 100, 0],
              rotate: [360, 180, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-blue-200/40 to-purple-200/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              x: [0, 50, 0],
              y: [0, -80, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-purple-200/20 to-blue-200/20 rounded-full blur-3xl"
          />
        </div>

        {/* Header */}
        <div className='bg-white/80 backdrop-blur-xl border-b border-white/50 relative z-10 shadow-lg'>
          <div className='container mx-auto px-4 py-8 md:py-12'>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='text-center mb-8'
            >
              <motion.div
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white px-4 py-2 rounded-full font-bold text-xs mb-4 shadow-xl"
                animate={{ 
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    "0 0 20px rgba(249, 115, 22, 0.3)",
                    "0 0 30px rgba(168, 85, 247, 0.4)",
                    "0 0 20px rgba(249, 115, 22, 0.3)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-4 w-4" />
                Our Blog
              </motion.div>
              
              <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight'>
                Latest
                <motion.span 
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500"
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  style={{ backgroundSize: '300% 300%' }}
                >
                  Articles & Insights
                </motion.span>
              </h1>
              
              <p className='text-gray-600 text-lg md:text-xl max-w-2xl mx-auto font-medium'>
                Stay updated with expert advice and industry trends
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div 
              className='max-w-2xl mx-auto'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className='relative'>
                <Search className='absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' />
                <input
                  type='text'
                  placeholder='Search articles...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full pl-14 pr-14 py-4 rounded-xl bg-white/90 backdrop-blur-sm border-2 border-white/50 focus:ring-2 focus:ring-orange-500/30 focus:bg-white focus:border-orange-300 transition-all text-gray-900 placeholder-gray-500 font-medium shadow-lg'
                />
                {searchTerm && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => setSearchTerm('')}
                    className='absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                  >
                    <X className='h-5 w-5' />
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Categories */}
        <div className='bg-white/70 backdrop-blur-xl border-b border-white/50 sticky top-0 z-20 shadow-md'>
          <div className='container mx-auto px-4 py-5'>
            <div className='flex gap-3 overflow-x-auto pb-2 scrollbar-hide'>
              {categories.map((category, index) => (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 shadow-lg ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white'
                      : 'bg-white/90 text-gray-700 hover:bg-white border-2 border-white/50'
                  }`}
                >
                  {category}
                  {category !== 'All' && (
                    <span className='ml-2 text-xs opacity-80'>
                      ({blogPosts.filter(p => p.category === category || p.tags?.includes(category)).length})
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className='container mx-auto px-4 py-6 relative z-10'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='flex items-center gap-3'
          >
            <div className='h-1 w-12 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded-full' />
            <p className='text-gray-700 text-sm font-bold'>
              {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'} found
            </p>
          </motion.div>
        </div>

        {/* Blog Grid */}
        <div className='container mx-auto px-4 pb-12 relative z-10'>
          {filteredPosts.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'>
              <AnimatePresence mode="popLayout">
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ y: -8 }}
                    className='h-full group'
                  >
                    <Link href={`/blogs/${post.id}`}>
                      <div className='relative bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-white/50 h-full flex flex-col group-hover:border-orange-200'>
                        
                        {/* Image */}
                        <div className='relative w-full' style={{ paddingBottom: '60%' }}>
                          <Image
                            src={post.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=75'}
                            alt={post.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className='object-cover group-hover:scale-110 transition-transform duration-700'
                            loading={index < 6 ? "eager" : "lazy"}
                            quality={75}
                            unoptimized
                          />
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          
                          {/* Category Badge */}
                          {post.category && (
                            <motion.div 
                              className='absolute top-4 left-4 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xl z-10'
                              whileHover={{ scale: 1.05 }}
                            >
                              {post.category}
                            </motion.div>
                          )}
                          
                          {/* Read Time */}
                          {post.readTime && (
                            <div className='absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-lg'>
                              <Clock className='h-3.5 w-3.5' />
                              {post.readTime}
                            </div>
                          )}

                          {/* Hover Arrow Indicator */}
                          <motion.div
                            className="absolute bottom-4 right-4 bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100"
                            initial={{ scale: 0, rotate: -180 }}
                            whileHover={{ scale: 1, rotate: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ArrowRight className="h-5 w-5 text-orange-600" />
                          </motion.div>
                        </div>

                        {/* Content */}
                        <div className='p-6 flex flex-col flex-grow'>
                          {/* Meta */}
                          <div className='flex items-center gap-4 text-xs text-gray-600 mb-4 font-medium'>
                            <span className='flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full'>
                              <User className='h-3.5 w-3.5' />
                              {post.author}
                            </span>
                            <span className='flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full'>
                              <Calendar className='h-3.5 w-3.5' />
                              {formatDate(post.date)}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className='font-bold text-lg md:text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:via-pink-600 group-hover:to-purple-600 transition-all leading-tight min-h-[56px]'>
                            {post.title}
                          </h3>

                          {/* Snippet */}
                          <p className='text-sm text-gray-600 line-clamp-3 leading-relaxed mb-5 flex-grow'>
                            {post.snippet}
                          </p>

                          {/* Footer */}
                          <div className='flex items-center justify-between pt-4 border-t-2 border-gray-100 group-hover:border-orange-100 transition-colors'>
                            <motion.div 
                              className='bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent font-bold text-sm flex items-center gap-1.5 group-hover:gap-3 transition-all'
                              whileHover={{ x: 5 }}
                            >
                              <span>Read More</span>
                              <ArrowRight className='h-4 w-4 text-orange-600' />
                            </motion.div>
                            
                            <motion.div
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                              className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Sparkles className="h-4 w-4 text-white" />
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div 
              className='text-center py-16'
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className='max-w-md mx-auto bg-white/80 backdrop-blur-xl p-10 rounded-3xl border-2 border-white/50 shadow-2xl'>
                <motion.div 
                  className='w-20 h-20 bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6'
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Search className='h-10 w-10 text-orange-500' />
                </motion.div>
                <h3 className='text-2xl font-bold text-gray-900 mb-4'>
                  No articles found
                </h3>
                <p className='text-gray-600 mb-8 leading-relaxed'>
                  {searchTerm 
                    ? `No results for "${searchTerm}". Try different keywords.`
                    : 'Check back soon for new content!'
                  }
                </p>
                {searchTerm && (
                  <motion.button
                    onClick={() => setSearchTerm('')}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 hover:from-orange-600 hover:via-pink-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl font-bold shadow-xl transition-all"
                  >
                    Clear Search
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}