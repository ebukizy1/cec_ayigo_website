import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { productService } from "@/services/productService";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  discountedPrice?: number;
  images: string[];
  inStock: boolean;
  category?: string;
}

export function ProductSpotlight() {
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [first] = await productService.getFeaturedProducts(1);
        if (mounted) setProduct(first);
      } catch {
        if (mounted) {
          setProduct({
            id: "1",
            name: "Complete Solar System 5KVA",
            price: 850000,
            discountedPrice: 750000,
            images: ["https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80&auto=format"],
            inStock: true,
            category: "Solar Systems",
          });
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    addToCart({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.discountedPrice || product.price,
      imageUrl: product.images[0],
      quantity: 1,
    });
    toast.success(`${product.name} added to cart!`);
  }, [addToCart, product]);

  if (!product) return null;

  const discountPercent = product.discountedPrice
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;

  return (
    <section className="py-10 md:py-12 bg-white">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="relative bg-white rounded-3xl p-6 shadow-xl border border-gray-100 overflow-hidden">
          <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden bg-gray-50 mb-5">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 40vw"
              className={`object-contain p-6 transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
              quality={85}
              onLoadingComplete={() => setLoaded(true)}
            />
            {discountPercent > 0 && (
              <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-2 rounded-full text-sm font-semibold shadow">
                {discountPercent}% OFF
              </div>
            )}
            {product.category && (
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold shadow">
                {product.category}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1 truncate">
                  {product.name}
                </h3>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-extrabold text-orange-600">
                    ₦{(product.discountedPrice || product.price).toLocaleString()}
                  </div>
                  {product.discountedPrice && (
                    <div className="text-sm text-gray-500 line-through font-medium">
                      ₦{product.price.toLocaleString()}
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
              onClick={handleAddToCart}
              className="w-full bg-orange-400 hover:bg-orange-500 text-white py-4 rounded-full font-medium shadow-sm hover:shadow transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}

