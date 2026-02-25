import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { 
  ShoppingCart, 
  ArrowRight, 
  Sun, 
  Zap,
  Shield,
  Phone,
  CheckCircle,
  BadgeCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from "sonner";
import { productService } from "@/services/productService";

interface Product {
  id: string;
  name: string;
  price: number;
  discountedPrice?: number;
  images: string[];
  description: string;
  inStock: boolean;
  category?: string;
}

export function HeroSection() {
  const router = useRouter();
  const { addToCart } = useCart();
  const SHOW_PRODUCT = false;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [imageLoaded, setImageLoaded] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!SHOW_PRODUCT) return;
    const fetchProducts = async () => {
      try {
        const featuredProducts = await productService.getFeaturedProducts(3);
        setProducts(featuredProducts);
        
        // Preload first image
        if (featuredProducts.length > 0) {
          const img = new window.Image();
          img.src = featuredProducts[0].images[0];
        }
      } catch (error) {
        setProducts([
          {
            id: "1",
            name: "Complete Solar System 5KVA",
            price: 850000,
            discountedPrice: 750000,
            images: ["https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80&auto=format"],
            description: "Complete solar package with battery & inverter",
            inStock: true,
            category: "Solar Systems"
          },
          {
            id: "2", 
            name: "Solar Street Light 150W",
            price: 180000,
            discountedPrice: 165000,
            images: ["https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80&auto=format"],
            description: "High-efficiency LED solar street light",
            inStock: true,
            category: "Street Lights"
          },
          {
            id: "3",
            name: "Lithium Battery 200AH",
            price: 450000,
            images: ["https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&q=80&auto=format"],
            description: "Long-lasting lithium battery",
            inStock: true,
            category: "Batteries"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [SHOW_PRODUCT]);

  // Preload next image when slide changes
  useEffect(() => {
    if (!SHOW_PRODUCT) return;
    if (products.length > 1) {
      const nextIndex = (currentSlide + 1) % products.length;
      const img = new window.Image();
      img.src = products[nextIndex].images[0];
    }
  }, [SHOW_PRODUCT, currentSlide, products]);

  useEffect(() => {
    if (!SHOW_PRODUCT) return;
    if (products.length > 1 && isAutoPlaying) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % products.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [SHOW_PRODUCT, products.length, isAutoPlaying]);

  const handleShopNow = useCallback(() => {
    router.push('/products');
  }, [router]);

  const handleAddToCart = useCallback((product: Product) => {
    try {
      addToCart({
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.discountedPrice || product.price,
        imageUrl: product.images[0],
        quantity: 1
      });
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error("Failed to add item to cart");
    }
  }, [addToCart]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % products.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + products.length) % products.length);
    setIsAutoPlaying(false);
  };

  const handleImageLoad = (productId: string) => {
    setImageLoaded(prev => ({ ...prev, [productId]: true }));
  };

  if (SHOW_PRODUCT && loading) {
    return (
      <section className='w-full h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50 flex items-center justify-center'>
        <div className='w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin' />
      </section>
    );
  }

  const currentProduct = SHOW_PRODUCT && products.length > 0 ? products[currentSlide] : undefined as any;
  const discountPercent = SHOW_PRODUCT && currentProduct?.discountedPrice
    ? Math.round(((currentProduct.price - currentProduct.discountedPrice) / currentProduct.price) * 100)
    : 0;

  return (
    <section className='relative w-full min-h-[60vh] md:min-h-[70vh] bg-white overflow-hidden'>
      <div className="pointer-events-none absolute -top-24 -left-20 w-72 h-72 bg-orange-50 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 w-80 h-80 bg-orange-50 rounded-full blur-3xl" />

      <div className='container mx-auto px-4 py-6 md:py-8 lg:py-10 relative z-10'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center'>
          
          {/* Left Content */}
          <motion.div 
            className='space-y-6 md:space-y-8'
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            
            {/* Brand Header - Compact */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow">
                <Sun className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#1F2933] tracking-tight">
                  CEC AYIGO AND SONS LIGHTINGS
                </h2>
                <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-200 w-fit">
                  <BadgeCheck className="h-4 w-4 text-green-600" />
                  <span>CAC Verified</span>
                </div>
              </div>
            </div>

            {/* Main Headline - Tighter Spacing */}
            <div className="space-y-3">
              <h1 className='text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1F2933] leading-tight'>
                Reliable Solar, Delivered
              </h1>
              
              <p className='text-base md:text-lg text-[#475569] leading-relaxed max-w-xl'>
                Quality systems. Fast installation. Lagos-wide support.
              </p>
            </div>

            {/* Spacer for visual rhythm */}
            <div className="h-2" />

            {SHOW_PRODUCT && (
            <motion.div 
              className='relative block lg:hidden'
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative bg-white rounded-3xl p-6 shadow-xl border border-gray-100 overflow-hidden">
                {products.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all"
                      aria-label="Previous product"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-700" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all"
                      aria-label="Next product"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-700" />
                    </button>
                  </>
                )}

                <div className="relative h-64 rounded-2xl overflow-hidden bg-gray-50 mb-5">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentProduct.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4 }}
                      className="relative w-full h-full"
                    >
                      {!imageLoaded[currentProduct.id] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      <div className={`relative w-full h-full ${imageLoaded[currentProduct.id] ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
                        <Image
                          src={currentProduct.images[0]}
                          alt={currentProduct.name}
                          fill
                          sizes="100vw"
                          className="object-contain p-6"
                          priority={currentSlide === 0}
                          quality={85}
                          onLoadingComplete={() => handleImageLoad(currentProduct.id)}
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAB8H/9k="
                        />
                      </div>

                      {discountPercent > 0 && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-2 rounded-full text-sm font-bold shadow-lg z-10"
                        >
                          {discountPercent}% OFF
                        </motion.div>
                      )}

                      {currentProduct.category && (
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md z-10">
                          {currentProduct.category}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1 truncate">
                        {currentProduct.name}
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <div className="text-3xl font-extrabold text-orange-600">
                          ₦{(currentProduct.discountedPrice || currentProduct.price).toLocaleString()}
                        </div>
                        {currentProduct.discountedPrice && (
                          <div className="text-sm text-gray-500 line-through font-medium">
                            ₦{currentProduct.price.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-green-700 font-bold bg-green-50 px-3 py-1.5 rounded-full border border-green-200 whitespace-nowrap">
                      In Stock
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAddToCart(currentProduct)}
                    className="w-full bg-orange-400 hover:bg-orange-500 text-white py-4 rounded-full font-medium shadow-sm hover:shadow transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                    <ArrowRight className="h-4 w-4" />
                  </motion.button>
                </div>

                {products.length > 1 && (
                  <div className="flex justify-center gap-1.5 mt-5">
                    {products.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentSlide(index);
                          setIsAutoPlaying(false);
                        }}
                        className={`h-1.5 rounded-full transition-all ${
                          index === currentSlide 
                            ? 'bg-orange-400 w-8' 
                            : 'bg-gray-300 w-1.5 hover:bg-gray-400'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
            )}

            {/* CTA Buttons */}
            <div className='flex flex-col sm:flex-row gap-3 pt-2'>
              <motion.button 
                whileHover={{ scale: 1.03 }} 
                whileTap={{ scale: 0.98 }}
                onClick={handleShopNow}
                className='w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-medium text-base shadow-sm hover:shadow transition-colors flex items-center justify-center gap-2'
              >
                <ShoppingCart className='h-5 w-5' />
                Shop Now
                <ArrowRight className='h-5 w-5' />
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.03 }} 
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = 'tel:+2348147254399'}
                className='w-full sm:w-auto border border-orange-200 bg-white hover:bg-orange-50 text-orange-700 px-8 py-4 rounded-full font-medium text-base shadow-sm hover:shadow transition-colors flex items-center justify-center gap-2'
              >
                <Phone className='h-5 w-5' />
                Call Now
              </motion.button>
            </div>

            {/* Trust Indicators - Compact */}
            <div className='flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100'>
              {[
                { text: "Trusted Customers" },
                { text: "Genuine Products" },
                { text: "Fast Delivery" }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Right Content - Sleeker Product Card */}
          {SHOW_PRODUCT && (
          <motion.div 
            className='relative hidden lg:block'
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative bg-white rounded-3xl p-6 shadow-xl border border-gray-100 overflow-hidden">
              
              {/* Navigation Arrows */}
              {products.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all group"
                    aria-label="Previous product"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-700 group-hover:text-orange-600" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all group"
                    aria-label="Next product"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-700 group-hover:text-orange-600" />
                  </button>
                </>
              )}

              {/* Product Display - Optimized Image Loading */}
              <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden bg-gray-50 mb-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentProduct.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                    className="relative w-full h-full"
                  >
                    {/* Loading Skeleton */}
                    {!imageLoaded[currentProduct.id] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    
                    <div className={`relative w-full h-full ${imageLoaded[currentProduct.id] ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
                      <Image
                        src={currentProduct.images[0]}
                        alt={currentProduct.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-contain p-6"
                        priority={currentSlide === 0}
                        quality={85}
                        onLoadingComplete={() => handleImageLoad(currentProduct.id)}
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAB8H/9k="
                      />
                    </div>
                    
                    {/* Discount Badge */}
                    {discountPercent > 0 && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-2 rounded-full text-sm font-semibold shadow z-10"
                      >
                        {discountPercent}% OFF
                      </motion.div>
                    )}

                    {/* Category Badge */}
                    {currentProduct.category && (
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md z-10">
                        {currentProduct.category}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
              
              {/* Product Info - Streamlined */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1 truncate">
                      {currentProduct.name}
                    </h3>
                    
                    {/* Price Display */}
                    <div className="flex items-baseline gap-2">
                      <div className="text-3xl font-extrabold text-orange-600">
                        ₦{(currentProduct.discountedPrice || currentProduct.price).toLocaleString()}
                      </div>
                      {currentProduct.discountedPrice && (
                        <div className="text-sm text-gray-500 line-through font-medium">
                          ₦{currentProduct.price.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-green-700 font-bold bg-green-50 px-3 py-1.5 rounded-full border border-green-200 whitespace-nowrap">
                    In Stock
                  </div>
                </div>
                
                {/* Add to Cart Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAddToCart(currentProduct)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-medium shadow hover:shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </div>

              {/* Slide Indicators */}
              {products.length > 1 && (
                    <div className="flex justify-center gap-1.5 mt-5">
                  {products.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentSlide(index);
                        setIsAutoPlaying(false);
                      }}
                          className={`h-1.5 rounded-full transition-all ${
                            index === currentSlide 
                              ? 'bg-orange-500 w-8' 
                              : 'bg-gray-300 w-1.5 hover:bg-gray-400'
                          }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
