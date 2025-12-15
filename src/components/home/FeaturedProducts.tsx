import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Heart, ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "sonner";
import { productService } from "@/services/productService";

interface Product {
  id: string;
  name: string;
  price: number;
  discountedPrice?: number;
  images: string[];
  description: string;
  rating?: number;
  inStock: boolean;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, e: React.MouseEvent<HTMLButtonElement>) => void;
  onAddToWishlist: (product: Product, e: React.MouseEvent<HTMLButtonElement>) => void;
  isInWishlist: (id: string) => boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onAddToWishlist,
  isInWishlist,
}) => {
  const discount = product.discountedPrice
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;

  return (
    <motion.div
      className="flex-shrink-0 w-[160px] sm:w-[200px] md:w-[240px] lg:w-[280px]"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50 h-full flex flex-col group">
        
        {/* Image Section */}
        <Link href={`/products/${product.id}`} className="relative block">
          <div className="relative w-full aspect-square">
            <Image
              src={product.images?.[0] || "https://images.pexels.com/photos/356036/pexels-photo-356036.jpeg"}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
              loading="lazy"
              quality={75}
              unoptimized
            />
          </div>

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md z-10">
              -{discount}%
            </div>
          )}

          {/* Wishlist Button */}
          <motion.button
            onClick={(e) => onAddToWishlist(product, e)}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Add to wishlist"
            type="button"
          >
            <Heart
              className={`h-4 w-4 ${
                isInWishlist(product.id)
                  ? "text-red-500 fill-current"
                  : "text-gray-600"
              }`}
            />
          </motion.button>
        </Link>

        {/* Content Section */}
        <div className="p-3 flex flex-col flex-grow">
          {/* Rating & Stock */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
              <span className="text-xs font-semibold text-gray-700">
                {product.rating?.toFixed(1) || '4.5'}
              </span>
            </div>
            {product.inStock ? (
              <span className="text-xs font-medium text-green-600">In Stock</span>
            ) : (
              <span className="text-xs font-medium text-red-600">Out</span>
            )}
          </div>

          {/* Product Name */}
          <Link href={`/products/${product.id}`}>
            <h3 className="font-semibold text-xs sm:text-sm text-gray-900 mb-2 line-clamp-2 hover:text-orange-600 transition-colors leading-tight min-h-[32px] sm:min-h-[40px]">
              {product.name}
            </h3>
          </Link>

          {/* Price */}
          <div className="mb-3 mt-auto">
            {product.discountedPrice ? (
              <div>
                <div className="text-base sm:text-lg font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  ₦{product.discountedPrice.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 line-through">
                  ₦{product.price.toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="text-base sm:text-lg font-bold text-gray-900">
                ₦{product.price.toLocaleString()}
              </div>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={(e) => onAddToCart(product, e)}
            disabled={!product.inStock}
            type="button"
            className={`w-full py-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
              product.inStock
                ? "bg-gradient-to-r from-orange-500 to-pink-500 active:from-orange-600 active:to-pink-600 text-white shadow-sm active:scale-95"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{product.inStock ? "Add to Cart" : "Out of Stock"}</span>
            <span className="sm:hidden">{product.inStock ? "Add" : "Out"}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Calculate how many products to show based on screen size
  const getVisibleCount = useCallback(() => {
    if (typeof window === 'undefined') return 4;
    const width = window.innerWidth;
    if (width < 640) return 2; // Mobile: 2 products
    if (width < 1024) return 3; // Tablet: 3 products
    return 4; // Desktop: 4 products
  }, []);

  const [visibleCount, setVisibleCount] = useState(4);

  // Fetch products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        console.log('🔍 Starting to fetch featured products...');
        const featuredProducts = await productService.getFeaturedProducts(8);
        console.log('✅ Fetched products count:', featuredProducts.length);
        setProducts(featuredProducts);
      } catch (error) {
        console.error("❌ Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  // Update visible count on mount and resize
  useEffect(() => {
    setVisibleCount(getVisibleCount());

    const handleResize = () => {
      setVisibleCount(getVisibleCount());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getVisibleCount]);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && products.length > visibleCount) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const maxIndex = products.length - visibleCount;
          return prev >= maxIndex ? 0 : prev + 1;
        });
      }, 3000); // Slide every 3 seconds
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, products.length, visibleCount]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev <= 0 ? products.length - visibleCount : prev - 1));
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => {
      const maxIndex = products.length - visibleCount;
      return prev >= maxIndex ? 0 : prev + 1;
    });
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product.inStock) {
      toast.error("Out of stock");
      return;
    }
    
    addToCart({
      id: Math.random().toString(36).substring(2, 9),
      productId: product.id,
      name: product.name,
      price: product.price,
      discountedPrice: product.discountedPrice,
      quantity: 1,
      imageUrl: product.images?.[0] || "",
    });
    
    toast.success("Added to cart!");
  };

  const handleAddToWishlist = (product: Product, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist(product.id)) {
      toast.info("Already in wishlist");
      return;
    }
    
    addToWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      discountedPrice: product.discountedPrice,
      imageUrl: product.images?.[0] || "",
    });
    
    toast.success("Added to wishlist!");
  };

  const maxIndex = Math.max(0, products.length - visibleCount);

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50">
        <div className="container mx-auto px-4 text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full mx-auto animate-spin" />
        </div>
      </section>
    );
  }

  if (!products.length) {
    return (
      <section className="py-12 md:py-16 bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 mb-4">No products available</p>
          <Link href="/products">
            <button className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm">
              Browse Products
            </button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50 relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-10 w-40 h-40 sm:w-64 sm:h-64 bg-gradient-to-r from-orange-200/30 to-pink-200/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, -50, 0],
            y: [0, 30, 0],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-10 w-40 h-40 sm:w-64 sm:h-64 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8 md:mb-12"
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 py-1.5 rounded-full font-semibold text-xs mb-3 shadow-lg"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Featured Products
          </motion.div>
          
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Best Selling
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500">
              Electronics
            </span>
          </h2>
          
          <p className="text-gray-600 text-xs sm:text-sm md:text-base max-w-xl mx-auto">
            Premium quality products trusted by thousands
          </p>
        </motion.div>
        
        {/* Carousel Container */}
        <div className="relative">
          
          {/* Navigation Buttons - Only show if there are more products than visible */}
          {products.length > visibleCount && (
            <>
              <button
                onClick={handlePrevious}
                type="button"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-all group"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 group-hover:text-orange-500" />
              </button>
              
              <button
                onClick={handleNext}
                type="button"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-all group"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 group-hover:text-orange-500" />
              </button>
            </>
          )}

          {/* Products Carousel */}
          <div 
            ref={containerRef}
            className="overflow-hidden"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <motion.div
              className="flex gap-3 sm:gap-4 md:gap-6"
              animate={{
                x: products.length > visibleCount ? `-${currentIndex * (100 / visibleCount)}%` : 0,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              style={{
                width: `${(products.length / visibleCount) * 100}%`,
              }}
            >
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                  isInWishlist={isInWishlist}
                />
              ))}
            </motion.div>
          </div>

          {/* Dots Indicator - Only show if there are more products than visible */}
          {products.length > visibleCount && maxIndex > 0 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsAutoPlaying(false);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'w-8 bg-gradient-to-r from-orange-500 to-pink-500'
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-8 sm:mt-10 md:mt-12"
        >
          <Link href="/products">
            <motion.button
              type="button"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-6 py-2.5 sm:px-8 sm:py-3 md:py-3.5 rounded-xl font-bold text-sm md:text-base shadow-lg hover:shadow-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>View All Products</span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
              </motion.div>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default FeaturedProducts;