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
  Sparkles,
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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [imageLoaded, setImageLoaded] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
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
  }, []);

  // Preload next image when slide changes
  useEffect(() => {
    if (products.length > 1) {
      const nextIndex = (currentSlide + 1) % products.length;
      const img = new window.Image();
      img.src = products[nextIndex].images[0];
    }
  }, [currentSlide, products]);

  useEffect(() => {
    if (products.length > 1 && isAutoPlaying) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % products.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [products.length, isAutoPlaying]);

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

  if (loading) {
    return (
      <section className='w-full h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50 flex items-center justify-center'>
        <div className='w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin' />
      </section>
    );
  }

  const currentProduct = products[currentSlide];
  const discountPercent = currentProduct.discountedPrice 
    ? Math.round(((currentProduct.price - currentProduct.discountedPrice) / currentProduct.price) * 100)
    : 0;

  return (
    <section className='relative w-full min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-100 overflow-hidden'>
      
      {/* Background Elements */}
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
      
      {/* Christmas Bonus Banner - Compact Design */}
      <motion.div 
        className="relative bg-gradient-to-r from-emerald-700 via-red-600 to-emerald-700 text-white py-2.5 md:py-3 overflow-hidden z-10"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Animated Gradient Background */}
        <motion.div
          className="absolute inset-0"
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
            backgroundSize: '50% 100%'
          }}
        />

        {/* Floating Sparkles - Reduced */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{ 
                x: `${15 + i * 17}%`, 
                y: -20,
                opacity: 0,
                scale: 0
              }}
              animate={{ 
                y: ['0%', '120%'],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                delay: i * 0.6,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="h-3 w-3 text-yellow-200" />
            </motion.div>
          ))}
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-center gap-2 md:gap-3">
            {/* Gift Icon */}
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="hidden sm:block"
            >
              <span className="text-base md:text-lg">🎁</span>
            </motion.div>

            {/* Main Content - Single Line */}
            <div className="flex items-center gap-1.5 md:gap-2">
              <motion.span 
                className="text-yellow-200 font-black text-sm md:text-base tracking-wide flex items-center gap-1"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-3 w-3 inline sm:hidden" />
                🎄 CHRISTMAS SPECIAL
              </motion.span>
              
              <span className="text-white/80 font-medium hidden sm:inline">•</span>
              
              <span className="text-white font-bold text-xs md:text-sm">
                <span className="text-yellow-300 text-sm md:text-base font-black">20% OFF</span>
                <span className="hidden sm:inline"> + Free Install</span>
              </span>
            </div>

            {/* Lightning Icon */}
            <motion.div
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, delay: 1 }}
              className="hidden sm:block"
            >
              <span className="text-base md:text-lg">⚡</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className='container mx-auto px-4 py-8 md:py-12 lg:py-16 relative z-10'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center'>
          
          {/* Left Content */}
          <motion.div 
            className='space-y-6 md:space-y-8'
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            
            {/* Brand Header - Compact */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sun className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  CeC AYIGO
                </h2>
                <p className="text-sm text-gray-600 font-medium">
                  Solar & Electrical Solutions
                </p>
              </div>
            </div>

            {/* Main Headline - Tighter Spacing */}
            <div className="space-y-3">
              <h1 className='text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight'>
                Power Your Home with
                <motion.span 
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600"
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  style={{ backgroundSize: '300% 300%' }}
                >
                  Clean Solar Energy
                </motion.span>
              </h1>
              
              <p className='text-lg text-gray-700 leading-relaxed max-w-xl'>
                Premium solar solutions with{' '}
                <span className="font-semibold text-orange-600">professional installation.</span>
                {' '}Trusted across Lagos, Nigeria.
              </p>
            </div>

            {/* Key Benefits - Compact Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Sun, title: "Solar Systems", subtitle: "Complete packages" },
                { icon: Zap, title: "Quality Inverters", subtitle: "Hybrid & Pure sine" },
                { icon: Shield, title: "2-Year Warranty", subtitle: "Quality guaranteed" },
                { icon: Phone, title: "Free Quote", subtitle: "Expert consultation" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm border border-white/60 p-3 rounded-xl shadow-sm hover:shadow-md transition-all group cursor-pointer"
                  whileHover={{ scale: 1.03, y: -3 }}
                >
                  <div className={`w-9 h-9 bg-gradient-to-r ${index % 2 === 0 ? 'from-orange-500 to-pink-500' : 'from-blue-500 to-purple-500'} rounded-lg flex items-center justify-center mb-2 shadow-sm group-hover:shadow-md transition-shadow`}>
                    <item.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-sm font-bold text-gray-900">
                    {item.title}
                  </div>
                  <div className="text-xs text-gray-600">{item.subtitle}</div>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className='flex flex-col sm:flex-row gap-3 pt-2'>
              <motion.button 
                whileHover={{ scale: 1.03 }} 
                whileTap={{ scale: 0.98 }}
                onClick={handleShopNow}
                className='w-full sm:w-auto bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group'
              >
                <ShoppingCart className='h-5 w-5' />
                Shop Solar Products
                <ArrowRight className='h-5 w-5 group-hover:translate-x-1 transition-transform' />
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.03 }} 
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = 'tel:+2348147254399'}
                className='w-full sm:w-auto border-2 border-orange-500 bg-white/90 backdrop-blur-sm hover:bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2'
              >
                <Phone className='h-5 w-5' />
                Call Us Now
              </motion.button>
            </div>

            {/* Trust Indicators - Compact */}
            <div className='flex flex-wrap items-center gap-4 pt-4 border-t border-white/40'>
              {[
                { text: "10,000+ Customers" },
                { text: "100% Authentic" },
                { text: "Same-Day Delivery" }
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
          <motion.div 
            className='relative'
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative bg-white/70 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-white/60 overflow-hidden">
              
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
              <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50/50 to-white/50 mb-5">
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
                        className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-2 rounded-full text-sm font-bold shadow-lg z-10"
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
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
                          ? 'bg-gradient-to-r from-orange-500 to-pink-500 w-8' 
                          : 'bg-gray-300 w-1.5 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}