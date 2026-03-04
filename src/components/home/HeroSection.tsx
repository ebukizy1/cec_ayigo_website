import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import {
  ShoppingCart,
  ArrowRight,
  Sun,
  Phone,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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

const SHOW_PRODUCT = false;

export function HeroSection() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [imageLoaded, setImageLoaded] = useState<{ [key: string]: boolean }>({});

  // Fetch products (only if SHOW_PRODUCT is true)
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
        // Fallback demo products
        setProducts([
          {
            id: "1",
            name: "Complete Solar System 5KVA",
            price: 850000,
            discountedPrice: 750000,
            images: ["https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80&auto=format"],
            description: "Complete solar package with battery & inverter",
            inStock: true,
            category: "Solar Systems",
          },
          {
            id: "2",
            name: "Solar Street Light 150W",
            price: 180000,
            discountedPrice: 165000,
            images: ["https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80&auto=format"],
            description: "High-efficiency LED solar street light",
            inStock: true,
            category: "Street Lights",
          },
          {
            id: "3",
            name: "Lithium Battery 200AH",
            price: 450000,
            images: ["https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&q=80&auto=format"],
            description: "Long-lasting lithium battery",
            inStock: true,
            category: "Batteries",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Preload next image when slide changes
  useEffect(() => {
    if (!SHOW_PRODUCT || products.length <= 1) return;
    const nextIndex = (currentSlide + 1) % products.length;
    const img = new window.Image();
    img.src = products[nextIndex].images[0];
  }, [currentSlide, products]);

  // Auto‑play carousel
  useEffect(() => {
    if (!SHOW_PRODUCT || products.length <= 1 || !isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % products.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [products.length, isAutoPlaying]);

  const handleShopNow = useCallback(() => {
    router.push("/products");
  }, [router]);

  const handleAddToCart = useCallback(
    (product: Product) => {
      try {
        addToCart({
          id: product.id,
          productId: product.id,
          name: product.name,
          price: product.discountedPrice || product.price,
          imageUrl: product.images[0],
          quantity: 1,
        });
        toast.success(`${product.name} added to cart!`);
      } catch {
        toast.error("Failed to add item to cart");
      }
    },
    [addToCart]
  );

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % products.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + products.length) % products.length);
    setIsAutoPlaying(false);
  };

  const handleImageLoad = (productId: string) => {
    setImageLoaded((prev) => ({ ...prev, [productId]: true }));
  };

  // Loading state
  if (SHOW_PRODUCT && loading) {
    return (
      <section className="w-full min-h-[70vh] bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </section>
    );
  }

  const currentProduct = SHOW_PRODUCT && products.length > 0 ? products[currentSlide] : null;
  const discountPercent =
    currentProduct?.discountedPrice
      ? Math.round(((currentProduct.price - currentProduct.discountedPrice) / currentProduct.price) * 100)
      : 0;

  return (
    <section className="relative w-full bg-[#F8FAFC] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 relative z-10">
        <div className={`grid grid-cols-1 ${SHOW_PRODUCT ? "lg:grid-cols-2" : "lg:grid-cols-1"} gap-8 lg:gap-12 items-center`}>
          {/* Left column: brand & messaging */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)" }}>
                <Sun className="h-6 w-6" style={{ color: "#F59E0B" }} />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: "#0F172A" }}>
                  CEC AYIGO AND SONS LIGHTINGS
                </h2>
                <p className="text-sm" style={{ color: "#64748B" }}>CAC Verified • Lagos-wide support</p>
              </div>
            </div>

            <div className="space-y-3 max-w-xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight" style={{ color: "#0F172A" }}>
                Reliable Solar, <br className="hidden sm:block" />
                Delivered to You
              </h1>
              <p className="text-base md:text-lg" style={{ color: "#64748B" }}>
                Quality systems, fast installation, and dedicated support across Lagos.
              </p>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleShopNow}
                className="inline-flex items-center justify-center gap-2 text-white px-6 py-3 rounded-2xl font-medium text-base shadow-sm transition-colors"
                style={{ background: "#F59E0B" }}
              >
                <ShoppingCart className="h-5 w-5" />
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </motion.button>

              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="tel:+2348147254399"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-medium text-base shadow-sm transition-colors"
                style={{ background: "#FFFFFF", color: "#0F172A", border: "1px solid #E5E7EB" }}
              >
                <Phone className="h-5 w-5" />
                Call Now
              </motion.a>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100">
              {["Trusted Customers", "Genuine Products", "Fast Delivery"].map((text, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: "#16A34A" }} />
                  <span className="text-sm font-medium" style={{ color: "#0F172A" }}>{text}</span>
                </div>
              ))}
            </div>

            {/* Mobile product card (only when SHOW_PRODUCT) */}
            {SHOW_PRODUCT && currentProduct && (
              <div className="lg:hidden mt-8">
                <ProductCard
                  product={currentProduct}
                  discountPercent={discountPercent}
                  imageLoaded={imageLoaded[currentProduct.id]}
                  onImageLoad={() => handleImageLoad(currentProduct.id)}
                  onAddToCart={() => handleAddToCart(currentProduct)}
                />
                {products.length > 1 && (
                  <CarouselIndicators
                    total={products.length}
                    current={currentSlide}
                    onChange={(index) => {
                      setCurrentSlide(index);
                      setIsAutoPlaying(false);
                    }}
                  />
                )}
              </div>
            )}
          </motion.div>

          {/* Right column: product carousel (desktop) */}
          {SHOW_PRODUCT && currentProduct && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block relative"
            >
              <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
                {products.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors"
                      aria-label="Previous product"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-700" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors"
                      aria-label="Next product"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-700" />
                    </button>
                  </>
                )}

                <ProductCard
                  product={currentProduct}
                  discountPercent={discountPercent}
                  imageLoaded={imageLoaded[currentProduct.id]}
                  onImageLoad={() => handleImageLoad(currentProduct.id)}
                  onAddToCart={() => handleAddToCart(currentProduct)}
                />

                {products.length > 1 && (
                  <CarouselIndicators
                    total={products.length}
                    current={currentSlide}
                    onChange={(index) => {
                      setCurrentSlide(index);
                      setIsAutoPlaying(false);
                    }}
                  />
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Subcomponents for better readability
// -----------------------------------------------------------------------------

interface ProductCardProps {
  product: Product;
  discountPercent: number;
  imageLoaded: boolean;
  onImageLoad: () => void;
  onAddToCart: () => void;
}

function ProductCard({ product, discountPercent, imageLoaded, onImageLoad, onAddToCart }: ProductCardProps) {
  return (
    <div className="space-y-4">
      {/* Image container */}
      <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={product.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full h-full"
          >
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <div className={`relative w-full h-full ${imageLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}>
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-contain p-4"
                onLoadingComplete={onImageLoad}
                priority
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Discount badge */}
        {discountPercent > 0 && (
          <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
            {discountPercent}% OFF
          </div>
        )}

        {/* Category badge */}
        {product.category && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-3 py-1 rounded-full shadow-sm z-10">
            {product.category}
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="space-y-2">
        <h3 className="font-bold text-gray-900 text-lg truncate">{product.name}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-orange-600">
            ₦{(product.discountedPrice || product.price).toLocaleString()}
          </span>
          {product.discountedPrice && (
            <span className="text-sm text-gray-400 line-through">
              ₦{product.price.toLocaleString()}
            </span>
          )}
        </div>
        <div className="text-sm text-green-700 font-medium bg-green-50 px-3 py-1 rounded-full inline-block">
          In Stock
        </div>
      </div>

      {/* Add to cart button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onAddToCart}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium shadow-sm transition-colors flex items-center justify-center gap-2"
      >
        <ShoppingCart className="h-5 w-5" />
        Add to Cart
        <ArrowRight className="h-4 w-4" />
      </motion.button>
    </div>
  );
}

interface CarouselIndicatorsProps {
  total: number;
  current: number;
  onChange: (index: number) => void;
}

function CarouselIndicators({ total, current, onChange }: CarouselIndicatorsProps) {
  return (
    <div className="flex justify-center gap-1.5 mt-4">
      {Array.from({ length: total }).map((_, idx) => (
        <button
          key={idx}
          onClick={() => onChange(idx)}
          className={`h-1.5 rounded-full transition-all ${
            idx === current ? "bg-orange-500 w-6" : "bg-gray-300 w-1.5 hover:bg-gray-400"
          }`}
          aria-label={`Go to slide ${idx + 1}`}
        />
      ))}
    </div>
  );
}
