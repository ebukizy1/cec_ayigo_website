import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Heart, ArrowRight, Sparkles } from "lucide-react";
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

const ProductCard = ({
  product,
  index,
  onAddToCart,
  onAddToWishlist,
  isInWishlist,
}: {
  product: Product;
  index: number;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onAddToWishlist: (product: Product, e: React.MouseEvent) => void;
  isInWishlist: (id: string) => boolean;
}) => {
  const discount = product.discountedPrice
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="h-full group"
    >
      <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-white/50 h-full flex flex-col">
        
        {/* Image Section */}
        <Link href={`/products/${product.id}`} className="relative block">
          <div className="relative w-full" style={{ paddingBottom: '100%' }}>
            <Image
              src={product.images?.[0] || "https://images.pexels.com/photos/356036/pexels-photo-356036.jpeg"}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
              loading={index < 4 ? "eager" : "lazy"}
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
            className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Add to wishlist"
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
            <h3 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2 hover:text-orange-600 transition-colors leading-tight min-h-[40px]">
              {product.name}
            </h3>
          </Link>

          {/* Price */}
          <div className="mb-3 mt-auto">
            {product.discountedPrice ? (
              <div>
                <div className="text-lg font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  ₦{product.discountedPrice.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 line-through">
                  ₦{product.price.toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="text-lg font-bold text-gray-900">
                ₦{product.price.toLocaleString()}
              </div>
            )}
          </div>

          {/* Add to Cart Button - Mobile Optimized */}
          <button
            onClick={(e) => onAddToCart(product, e)}
            disabled={!product.inStock}
            className={`w-full py-2.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
              product.inStock
                ? "bg-gradient-to-r from-orange-500 to-pink-500 active:from-orange-600 active:to-pink-600 text-white shadow-sm active:shadow-md active:scale-95"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>{product.inStock ? "Add to Cart" : "Out of Stock"}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const featuredProducts = await productService.getFeaturedProducts(8);
        setProducts(featuredProducts);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
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

  const handleAddToWishlist = (product: Product, e: React.MouseEvent) => {
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
    <section className="py-12 md:py-16 bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50 relative overflow-hidden">
      
      {/* Background Elements - Animated */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-r from-orange-200/30 to-pink-200/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, -50, 0],
            y: [0, 30, 0],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-10 w-64 h-64 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-12"
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 py-1.5 rounded-full font-semibold text-xs mb-3 shadow-lg"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Featured Products
          </motion.div>
          
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Best Selling
            <motion.span 
              className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{ backgroundSize: '300% 300%' }}
            >
              Electronics
            </motion.span>
          </h2>
          
          <p className="text-gray-600 text-sm md:text-base max-w-xl mx-auto">
            Premium quality products trusted by thousands
          </p>
        </motion.div>
        
        {/* Products Grid - Optimized for Mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-8 md:mb-12">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              isInWishlist={isInWishlist}
            />
          ))}
        </div>
        
        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href="/products">
            <motion.button
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-6 py-3 md:px-8 md:py-3.5 rounded-xl font-bold text-sm md:text-base shadow-lg hover:shadow-xl transition-all"
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