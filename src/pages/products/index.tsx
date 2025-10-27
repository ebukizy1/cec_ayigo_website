import React, { useState, useEffect, useMemo, useCallback } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  ChevronDown, 
  Star, 
  Heart, 
  ShoppingCart,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { productService } from '@/services/productService';
import { toast } from 'sonner';
import { useCart } from "@/contexts/CartContext";

interface Product {
  id: string;
  name: string;
  price: number;
  discountedPrice?: number;
  imageUrl: string;
  category: string;
  rating?: number;
  reviews?: number;
}

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "Solar generators and solar kits", label: "Solar Generators & Kits" },
  { value: "Solar streetlights", label: "Solar Streetlights" },
  { value: "Solar Floodlights", label: "Solar Floodlights" },
  { value: "Solar fans", label: "Solar Fans" },
  { value: "Solar cameras", label: "Solar Cameras" },
  { value: "AI solar camera streetlight", label: "AI Solar Camera Streetlight" },
  { value: "Solar Flourescent lamps", label: "Solar Fluorescent Lamps" },
  { value: "Solar ceiling lamps", label: "Solar Ceiling Lamps" },
  { value: "Solar panels", label: "Solar Panels" },
  { value: "Lithium battery, lithium tubular battery", label: "Lithium Batteries" },
  { value: "Hybrid inverters", label: "Hybrid Inverters" }
];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "priceLow", label: "Price: Low to High" },
  { value: "priceHigh", label: "Price: High to Low" },
  { value: "name", label: "Name A-Z" },
  { value: "rating", label: "Highest Rated" }
];

const ITEMS_PER_PAGE = 20;

// Memoized Product Card Component
const ProductCard = React.memo(({ 
  product, 
  index, 
  viewMode, 
  isFavorite, 
  onToggleFavorite, 
  onAddToCart 
}: { 
  product: Product; 
  index: number; 
  viewMode: 'grid' | 'list';
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const calculateDiscount = (originalPrice: number, discountedPrice: number) => {
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.02, 0.4) }}
      className={viewMode === 'list' ? 'w-full' : ''}
    >
      <Link href={`/products/${product.id}`}>
        <Card className={`group overflow-hidden border border-white/60 hover:shadow-2xl hover:border-orange-300 transition-all duration-300 bg-white/80 backdrop-blur-sm h-full ${
          viewMode === 'list' ? 'flex' : 'flex flex-col'
        }`}>
          {/* Product Image */}
          <div className={`relative overflow-hidden bg-gradient-to-br from-gray-50 to-white flex-shrink-0 ${
            viewMode === 'list' 
              ? 'w-32 h-32' 
              : 'w-full aspect-square'
          }`}>
            {/* Loading Skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            
            <div className={`relative w-full h-full ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes={viewMode === 'list' 
                  ? '128px' 
                  : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw'
                }
                className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                loading={index < 8 ? "eager" : "lazy"}
                quality={75}
                onLoadingComplete={() => setImageLoaded(true)}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAB8H/9k="
              />
            </div>
            
            {/* Discount Badge */}
            {product.discountedPrice && (
              <div className="absolute top-2 left-2 z-10">
                <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  -{calculateDiscount(product.price, product.discountedPrice)}%
                </span>
              </div>
            )}

            {/* Favorite Button */}
            <button
              onClick={(e) => onToggleFavorite(product.id, e)}
              className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-sm hover:shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
              aria-label="Add to favorites"
            >
              <Heart 
                size={16} 
                className={`${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
              />
            </button>

            {/* Quick Add Button (Desktop) */}
            <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block z-10">
              <Button
                size="sm"
                className="w-full h-8 text-xs bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-lg shadow-lg"
                onClick={(e) => onAddToCart(product, e)}
              >
                <ShoppingCart size={12} className="mr-1" />
                Add to Cart
              </Button>
            </div>
          </div>

          {/* Product Info */}
          <CardContent className={`p-4 flex-1 flex flex-col ${viewMode === 'list' ? 'justify-between' : ''}`}>
            <div className="flex-1">
              <h3 className={`font-semibold text-gray-900 line-clamp-2 mb-2 ${
                viewMode === 'list' ? 'text-base' : 'text-sm'
              }`}>
                {product.name}
              </h3>
              
              {/* Rating */}
              {product.rating && (
                <div className="flex items-center gap-1 mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={`${
                          i < product.rating! 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    ({product.reviews})
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-2 mb-3">
              {product.discountedPrice ? (
                <>
                  <span className="font-bold text-orange-600">
                    ₦{product.discountedPrice.toLocaleString()}
                  </span>
                  <span className="text-gray-500 line-through text-sm">
                    ₦{product.price.toLocaleString()}
                  </span>
                </>
              ) : (
                <span className="font-bold text-gray-900">
                  ₦{product.price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Mobile Add to Cart */}
            <Button
              size="sm"
              className="w-full h-9 text-sm sm:hidden bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-lg shadow-lg"
              onClick={(e) => onAddToCart(product, e)}
            >
              <ShoppingCart size={14} className="mr-2" />
              Add to Cart
            </Button>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

export default function ProductsPage() {
  const { addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const handleAddToCart = useCallback((product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      id: Math.random().toString(36).substring(2, 9),
      productId: product.id,
      name: product.name,
      price: product.price,
      discountedPrice: product.discountedPrice,
      quantity: 1,
      imageUrl: product.imageUrl
    });
    
    toast.success(`${product.name} added to cart!`);
  }, [addToCart]);

  const toggleFavorite = useCallback((productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (prev.has(productId)) {
        newFavorites.delete(productId);
        toast.success('Removed from favorites');
      } else {
        newFavorites.add(productId);
        toast.success('Added to favorites');
      }
      return newFavorites;
    });
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await productService.getAllProducts();
        
        const formattedProducts = productsData.map(product => ({
          id: product.id,
          name: product.name,
          price: product.price,
          discountedPrice: product.discountedPrice,
          imageUrl: product.images && product.images.length > 0 ? product.images[0] : 'https://images.pexels.com/photos/356036/pexels-photo-356036.jpeg',
          category: product.category, // Use exact category from database
          rating: Math.floor(Math.random() * 2) + 4,
          reviews: Math.floor(Math.random() * 100) + 10
        }));
        
        setProducts(formattedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case 'priceLow':
          return (a.discountedPrice || a.price) - (b.discountedPrice || b.price);
        case 'priceHigh':
          return (b.discountedPrice || b.price) - (a.discountedPrice || a.price);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });
  }, [filteredProducts, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedProducts, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('featured');
  }, []);

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-100'>
        <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/60">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center max-w-3xl mx-auto">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
                <div className="h-8 bg-gray-200 rounded w-64 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Products | AYIGO - Premium Solar Solutions</title>
        <meta name="description" content="Browse our collection of high-quality solar products. Find solar panels, batteries, inverters and more." />
        <meta name="keywords" content="solar products, solar panels, batteries, inverters, solar lights" />
        <link rel="preconnect" href="https://images.pexels.com" />
        <link rel="dns-prefetch" href="https://images.pexels.com" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-100 relative overflow-hidden">
        {/* Background Elements - Matching Hero Section */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ x: [0, 100, 0], y: [0, -50, 0], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-orange-200/30 to-pink-200/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -100, 0], y: [0, 100, 0], rotate: [360, 180, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-blue-200/40 to-purple-200/30 rounded-full blur-3xl"
          />
        </div>

        {/* Header Section */}
        <div className="bg-white/70 backdrop-blur-sm shadow-sm border-b border-white/60 relative z-10">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="text-center max-w-3xl mx-auto mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg"
              >
                <Sparkles className="h-4 w-4" />
                Premium Quality Products
              </motion.div>
              
              <motion.h1 
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">Products</span>
              </motion.h1>
              
              <motion.p 
                className="text-base md:text-lg text-gray-600 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Discover our comprehensive range of premium solar and electrical solutions
              </motion.p>
            </div>

            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="max-w-4xl mx-auto"
            >
              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-500 h-5 w-5" />
                <Input
                  type="search"
                  placeholder="Search for products..."
                  className="pl-12 h-12 bg-white/90 border-2 border-white/60 focus:border-orange-400 text-base rounded-xl shadow-lg placeholder:text-gray-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filter Buttons Row */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
                <Button
                  variant="outline"
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="flex items-center gap-2 h-10 px-4 rounded-lg bg-white/90 border-2 border-white/60 hover:border-orange-400 text-gray-700 font-medium shadow-md hover:shadow-lg transition-all"
                >
                  <Filter className="h-4 w-4 text-orange-500" />
                  {CATEGORIES.find(cat => cat.value === selectedCategory)?.label || 'All Categories'}
                  <ChevronDown className="h-4 w-4" />
                </Button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white/90 border-2 border-white/60 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-orange-400 focus:border-orange-400 focus:outline-none h-10 shadow-md"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <div className="flex border-2 border-white/60 rounded-lg overflow-hidden bg-white/90 shadow-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`rounded-none border-0 px-3 h-10 ${viewMode === 'grid' ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' : 'text-gray-700'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`rounded-none border-0 px-3 h-10 ${viewMode === 'list' ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' : 'text-gray-700'}`}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Results Count */}
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  {sortedProducts.length} products found
                  {selectedCategory !== 'all' && (
                    <span className="ml-2 inline-flex items-center gap-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      {CATEGORIES.find(cat => cat.value === selectedCategory)?.label}
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                        aria-label="Clear category filter"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Mobile Category Filter Dropdown */}
        <AnimatePresence>
          {showMobileFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/80 backdrop-blur-sm border-b border-white/60 shadow-sm relative z-10"
            >
              <div className="container mx-auto px-4 py-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => {
                        setSelectedCategory(category.value);
                        setShowMobileFilters(false);
                      }}
                      className={`p-3 text-sm rounded-lg text-left transition-colors ${
                        selectedCategory === category.value
                          ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold shadow-lg'
                          : 'bg-white/90 text-gray-700 hover:bg-white border border-white/60'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Section */}
        <div className="container mx-auto px-4 py-6 md:py-8 relative z-10">
          {paginatedProducts.length > 0 ? (
            <>
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4" 
                  : "space-y-4"
              }>
                {paginatedProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    viewMode={viewMode}
                    isFavorite={favorites.has(product.id)}
                    onToggleFavorite={toggleFavorite}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="h-10 px-3 bg-white/80 border-white/60 hover:border-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      // Show first, last, current, and neighbors
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={`h-10 w-10 ${
                              currentPage === page
                                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                                : 'bg-white/80 border-white/60 hover:border-orange-400 text-gray-700'
                            }`}
                          >
                            {page}
                          </Button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="text-gray-500">...</span>;
                      }
                      return null;
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="h-10 px-3 bg-white/80 border-white/60 hover:border-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12 md:py-16"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm md:text-base">
                We couldn't find any products matching your criteria
              </p>
              <Button
                onClick={clearFilters}
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto shadow-lg"
              >
                Clear all filters
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </div>

        {/* Trust Section */}
        <div className="bg-white/70 backdrop-blur-sm border-t border-white/60 relative z-10">
          <div className="container mx-auto px-4 py-6 md:py-8">
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 text-center">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-orange-500" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900 text-sm">Secure Shopping</div>
                  <div className="text-xs">Bank-level security</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-orange-500" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900 text-sm">Quality Guaranteed</div>
                  <div className="text-xs">Premium products only</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Zap className="h-5 w-5 text-orange-500" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900 text-sm">Fast Delivery</div>
                  <div className="text-xs">Quick & reliable shipping</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}