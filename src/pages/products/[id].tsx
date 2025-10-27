import React, { useState, useEffect, useCallback, useMemo } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Star, 
  Check, 
  Truck, 
  ArrowLeft, 
  Plus, 
  Minus,
  Shield,
  RefreshCw,
  Award,
  MessageCircle,
  ChevronRight,
  Sparkles,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { productService, Product } from "@/services/productService";

// Memoized Related Product Card
const RelatedProductCard = React.memo(({ product }: { product: Product }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ y: -4 }}
    className="group"
  >
    <Link href={`/products/${product.id}`}>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border border-white/50 h-full">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <Image
            src={product.images?.[0] || "https://images.pexels.com/photos/356036/pexels-photo-356036.jpeg"}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            quality={75}
          />
          {product.discountedPrice && (
            <Badge className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs shadow-lg">
              SALE
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm lg:text-base mb-2 text-gray-800 line-clamp-2 group-hover:text-orange-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            {product.discountedPrice ? (
              <>
                <span className="text-orange-600 font-bold text-sm lg:text-base">
                  ₦{product.discountedPrice.toLocaleString()}
                </span>
                <span className="text-gray-500 line-through text-xs lg:text-sm">
                  ₦{product.price.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-orange-600 font-bold text-sm lg:text-base">
                ₦{product.price.toLocaleString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  </motion.div>
));

RelatedProductCard.displayName = 'RelatedProductCard';

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    let mounted = true;
    
    const loadProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const productData = await productService.getProductById(id as string);
        
        if (!mounted) return;
        
        if (!productData) {
          toast.error('Product not found');
          router.push('/products');
          return;
        }
        
        setProduct(productData);
        
        if (productData.category) {
          const categoryProducts = await productService.getProductsByCategory(productData.category, 4);
          if (!mounted) return;
          
          const filtered = categoryProducts
            .filter(p => p.id !== id)
            .slice(0, 4);
          setRelatedProducts(filtered);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        if (mounted) {
          toast.error('Failed to load product details');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProduct();
    
    return () => {
      mounted = false;
    };
  }, [id, router]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    
    addToCart({
      id: Math.random().toString(36).substring(2, 9),
      productId: product.id,
      name: product.name,
      price: product.price,
      discountedPrice: product.discountedPrice,
      quantity: quantity,
      imageUrl: product.images?.[0] || ""
    });
    
    toast.success(`${product.name} added to cart`);
  }, [product, quantity, addToCart]);

  const handleBuyNow = useCallback(() => {
    handleAddToCart();
    router.push("/cart");
  }, [handleAddToCart, router]);
  
  const handleAddToWishlist = useCallback(() => {
    if (!product) return;
    
    addToWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      discountedPrice: product.discountedPrice,
      imageUrl: product.images?.[0] || ""
    });
    
    toast.success(`${product.name} added to wishlist`);
  }, [product, addToWishlist]);
  
  const handleShare = useCallback(async () => {
    if (!product) return;
    
    try {
      if (navigator.share && navigator.canShare()) {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
        toast.success("Shared successfully");
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      }
    } catch (error) {
      toast.error("Failed to share");
    }
  }, [product]);

  const calculateDiscount = useMemo(() => {
    if (!product?.discountedPrice) return 0;
    return Math.round(((product.price - product.discountedPrice) / product.price) * 100);
  }, [product]);

  const productImages = useMemo(() => 
    product?.images?.length ? product.images : ["https://images.pexels.com/photos/356036/pexels-photo-356036.jpeg"],
    [product]
  );
  
  const productFeatures = useMemo(() => 
    product?.features || [
      "High-quality product",
      "Durable construction", 
      "Easy to use",
      "Excellent value"
    ],
    [product]
  );
  
  const productSpecifications = useMemo(() => 
    product?.specifications || {
      "Material": "Premium quality",
      "Dimensions": "Standard size", 
      "Weight": "Standard weight",
      "Warranty": "1 year"
    },
    [product]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Product not found</p>
          <Button 
            onClick={() => router.push("/products")}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
          >
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{product.name} | AYIGO - Premium Solar Solutions</title>
        <meta name="description" content={product.description?.substring(0, 160) || `Details for ${product.name}`} />
        <meta name="keywords" content={`${product.name}, ${product.category}, solar products`} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="preconnect" href="https://images.pexels.com" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-10 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 left-10 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-r from-orange-200/30 to-yellow-200/30 rounded-full blur-3xl"
          />
        </div>

        {/* Breadcrumb */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-20">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-600 overflow-x-auto scrollbar-hide">
              <Link href="/" className="hover:text-orange-500 whitespace-nowrap transition-colors">Home</Link>
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <Link href="/products" className="hover:text-orange-500 whitespace-nowrap transition-colors">Products</Link>
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <Link href={`/products?category=${product.category}`} className="hover:text-orange-500 capitalize whitespace-nowrap transition-colors">
                {product.category}
              </Link>
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="text-gray-900 truncate font-medium">{product.name}</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-4 md:py-6 lg:py-8 relative z-10">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            className="mb-4 md:mb-6 flex items-center gap-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 p-0 h-auto"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm md:text-base">Back</span>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm border border-white/50 shadow-lg">
                  <Image
                    src={productImages[selectedImage]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-contain p-4 md:p-8 transition-all duration-500"
                    priority
                    quality={85}
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                    {product.discountedPrice && (
                      <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg text-xs">
                        -{calculateDiscount}% OFF
                      </Badge>
                    )}
                    {!product.inStock && (
                      <Badge className="bg-gray-900 text-white text-xs">
                        Out of Stock
                      </Badge>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="rounded-full w-9 h-9 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                      onClick={handleAddToWishlist}
                    >
                      <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="rounded-full w-9 h-9 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4 text-gray-600" />
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Thumbnail Images */}
              {productImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        selectedImage === index 
                          ? 'border-orange-500 shadow-md scale-105 ring-2 ring-orange-200' 
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} - View ${index + 1}`}
                        fill
                        sizes="80px"
                        className="object-contain p-1"
                        loading="lazy"
                        quality={60}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4 md:space-y-6"
            >
              {/* Rating and Reviews */}
              <div className="flex items-center gap-3 md:gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-3.5 w-3.5 md:h-4 md:w-4 ${i < Math.floor(product.rating || 4.5) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                  <span className="ml-1 text-sm font-semibold text-gray-700">
                    {product.rating || 4.5}
                  </span>
                </div>
                <span className="text-xs md:text-sm text-gray-500">
                  ({product.reviewCount || 0} reviews)
                </span>
              </div>

              {/* Product Title */}
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                  {product.name}
                </h1>
                <p className="text-gray-600 text-xs md:text-sm">
                  SKU: {product.id}
                </p>
              </div>

              {/* Price */}
              <div className="space-y-2 bg-gradient-to-r from-orange-50 to-pink-50 p-4 md:p-5 rounded-xl border border-orange-100">
                <div className="flex items-baseline gap-2 md:gap-3 flex-wrap">
                  {product.discountedPrice ? (
                    <>
                      <span className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                        ₦{product.discountedPrice.toLocaleString()}
                      </span>
                      <span className="text-lg md:text-xl text-gray-500 line-through">
                        ₦{product.price.toLocaleString()}
                      </span>
                      <Badge className="bg-green-100 text-green-800 border border-green-200 text-xs">
                        Save ₦{(product.price - product.discountedPrice).toLocaleString()}
                      </Badge>
                    </>
                  ) : (
                    <span className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                      ₦{product.price.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/50">
                <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm p-3 rounded-xl border border-white/50">
                {product.inStock ? (
                  <>
                    <Check className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                    <span className="text-green-600 font-semibold text-sm md:text-base">
                      In Stock - Ready to Ship
                    </span>
                  </>
                ) : (
                  <span className="text-red-600 font-semibold text-sm md:text-base">
                    Currently Out of Stock
                  </span>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="space-y-3 md:space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center border-2 border-orange-200 rounded-xl bg-white w-fit">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 md:h-12 md:w-12 rounded-l-xl hover:bg-orange-50"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="h-10 w-12 md:h-12 md:w-16 flex items-center justify-center text-gray-800 font-bold text-base md:text-lg">
                      {quantity}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 md:h-12 md:w-12 rounded-r-xl hover:bg-orange-50"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-5 md:py-6 text-base md:text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    Add to Cart
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-orange-500 text-orange-600 hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-500 hover:text-white py-5 md:py-6 text-base md:text-lg font-bold rounded-xl transition-all duration-300"
                    onClick={handleBuyNow}
                    disabled={!product.inStock}
                  >
                    Buy Now
                  </Button>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 pt-2 md:pt-4">
                <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-600 bg-white/70 backdrop-blur-sm p-3 rounded-xl border border-white/50">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Truck className="h-3.5 w-3.5 md:h-4 md:w-4 text-orange-600" />
                  </div>
                  <span className="font-medium">Free Shipping</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-600 bg-white/70 backdrop-blur-sm p-3 rounded-xl border border-white/50">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <RefreshCw className="h-3.5 w-3.5 md:h-4 md:w-4 text-orange-600" />
                  </div>
                  <span className="font-medium">Easy Returns</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-600 bg-white/70 backdrop-blur-sm p-3 rounded-xl border border-white/50">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-3.5 w-3.5 md:h-4 md:w-4 text-orange-600" />
                  </div>
                  <span className="font-medium">2 Year Warranty</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Product Details Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-8 md:mt-12 lg:mt-16"
          >
            <Card className="border border-white/50 bg-white/70 backdrop-blur-sm shadow-lg">
              <CardContent className="p-0">
                <Tabs defaultValue="features" className="w-full">
                  <TabsList className="w-full justify-start rounded-none border-b border-gray-200 bg-transparent h-auto p-0 overflow-x-auto scrollbar-hide">
                    <TabsTrigger 
                      value="features" 
                      className="rounded-none px-4 md:px-6 py-3 md:py-4 text-sm md:text-base data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-orange-600 font-semibold whitespace-nowrap"
                    >
                      Features
                    </TabsTrigger>
                    <TabsTrigger 
                      value="specifications" 
                      className="rounded-none px-4 md:px-6 py-3 md:py-4 text-sm md:text-base data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-orange-600 font-semibold whitespace-nowrap"
                    >
                      Specifications
                    </TabsTrigger>
                    <TabsTrigger 
                      value="reviews" 
                      className="rounded-none px-4 md:px-6 py-3 md:py-4 text-sm md:text-base data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-orange-600 font-semibold whitespace-nowrap"
                    >
                      Reviews ({product.reviewCount || 0})
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="features" className="p-4 md:p-6">
                    <div className="space-y-4">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                        Product Features
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {productFeatures.map((feature: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 bg-gradient-to-r from-orange-50 to-pink-50 p-3 md:p-4 rounded-lg border border-orange-100">
                            <Check className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700 text-sm md:text-base">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="specifications" className="p-4 md:p-6">
                    <div className="space-y-4">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Award className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                        Technical Specifications
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                        {Object.entries(productSpecifications).map(([key, value], index) => (
                          <div key={index} className="flex flex-col sm:flex-row py-3 px-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg border border-orange-100">
                            <span className="font-semibold text-gray-800 sm:min-w-[140px] text-sm md:text-base">{key}:</span>
                            <span className="text-gray-700 sm:ml-4 text-sm md:text-base">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="reviews" className="p-4 md:p-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                          Customer Reviews
                        </h3>
                        <Button className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-sm md:text-base">
                          <MessageCircle className="h-4 w-4" />
                          Write a Review
                        </Button>
                      </div>
                      
                      <div className="text-center py-12 bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200 rounded-xl">
                        <MessageCircle className="h-10 w-10 md:h-12 md:w-12 text-orange-400 mx-auto mb-4" />
                        <p className="text-gray-700 text-base md:text-lg font-semibold">No reviews yet</p>
                        <p className="text-gray-600 text-xs md:text-sm mt-2">Be the first to review this product</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mt-8 md:mt-12 lg:mt-16"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <Zap className="h-5 w-5 md:h-6 md:w-6 text-orange-500" />
                  Related Products
                </h2>
                <Link href={`/products?category=${product.category}`}>
                  <Button variant="ghost" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 text-sm md:text-base">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <RelatedProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}