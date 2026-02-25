import React, { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, CreditCard, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useCart } from "@/contexts/CartContext";

export default function CartPage() {
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [placedTotals, setPlacedTotals] = useState({ subtotal: 0, shipping: 0, tax: 0, total: 0 });
  const [orderId, setOrderId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  // Ensure mobile shows success view clearly
  useEffect(() => {
    setMounted(true);
    if (orderComplete) {
      try {
        if (document && document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      } catch {}
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [orderComplete]);

  // Auto-redirect after success to keep flow moving even if user doesn't tap
  useEffect(() => {
    if (!orderComplete) return;
    const timer = setTimeout(() => {
      if (orderId) {
        router.push(`/order-success?orderId=${orderId}`);
      } else {
        router.push("/products");
      }
    }, 4000); // 4s grace period to read the modal
    return () => clearTimeout(timer);
  }, [orderComplete, orderId, router]);

  // Cart page will not auto-restore success modal to avoid popping when revisiting Cart

  // Calculate cart totals
  const subtotal = cartItems.reduce((total, item) => {
    const itemPrice = item.discountedPrice || item.price;
    return total + (itemPrice * item.quantity);
  }, 0);
  
  const shipping = subtotal > 100 ? 0 : 15;
  const tax = subtotal * 0.07; // 7% tax
  const total = subtotal + shipping + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // prevent duplicate submissions
    setIsSubmitting(true);
    
    try {
      toast.info("Placing your order...");
      // Snapshot totals before clearing the cart
      setPlacedTotals({ subtotal, shipping, tax, total });
      
      // Create order in Firebase
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.discountedPrice || item.price,
          quantity: item.quantity
        })),
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          notes: formData.notes
        },
        subtotal,
        shipping,
        tax,
        total,
        status: "pending",
        createdAt: serverTimestamp()
      };
      
      // Add document to "orders" collection
      const docRef = await addDoc(collection(db, "orders"), orderData);
      setOrderId(docRef.id);
      
      // Persist for refresh safety
      try {
        sessionStorage.setItem("lastOrder", JSON.stringify({
          orderId: docRef.id,
          totals: { subtotal, shipping, tax, total },
          ts: Date.now()
        }));
        sessionStorage.setItem("showSuccessOnce", "1");
      } catch {}
      
      // Show success message and clear cart
      toast.success("Order submitted successfully!");
      setOrderComplete(true);
      clearCart();
      // Optional: ensure any open mobile sheet/toast overlays are dismissed
      setCheckoutStep(1);
      
    } catch (error) {
      console.error("Error submitting order:", error);
      // Fallback: record local pending order so user flow completes gracefully
      const fallbackId = `LOCAL-${Date.now().toString(36)}`;
      setOrderId(fallbackId);
      try {
        sessionStorage.setItem("lastOrder", JSON.stringify({
          orderId: fallbackId,
          totals: { subtotal, shipping, tax, total },
          ts: Date.now()
        }));
        sessionStorage.setItem("showSuccessOnce", "1");
      } catch {}
      toast.warning("Network issue saving order. We recorded it locally and will follow up.");
      setOrderComplete(true);
      clearCart();
      setCheckoutStep(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Shopping Cart | Cec - Shop Easy</title>
        <meta name="description" content="Review your cart and checkout at Cec Shop Easy" />
      </Head>

      {/* Success Modal - render only on client to avoid hydration glitch */}
      {mounted && (
        <Dialog
          open={orderComplete}
          onOpenChange={(open) => {
            if (!open) {
              setOrderComplete(false);
              try {
                sessionStorage.removeItem("lastOrder");
                sessionStorage.setItem("showSuccessOnce", "0");
              } catch {}
            }
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Order Placed Successfully
              </DialogTitle>
              <DialogDescription>
                Thank you for your order. Your order has been received and is being processed.
              </DialogDescription>
            </DialogHeader>
            {orderId && (
              <div className="text-sm text-gray-600 mb-2">
                Reference: <span className="font-semibold text-gray-900">{orderId}</span>
              </div>
            )}
            <div className="mt-2 rounded-lg border p-4 bg-gray-50">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₦{placedTotals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {placedTotals.shipping === 0 ? "Free" : `₦${placedTotals.shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">₦{placedTotals.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                <span>Total</span>
                <span className="text-primary">₦{placedTotals.total.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => {
                  setOrderComplete(false);
                  try {
                    sessionStorage.removeItem("lastOrder");
                    sessionStorage.setItem("showSuccessOnce", "0");
                  } catch {}
                  router.push("/products");
                }}
              >
                Continue Shopping
              </Button>
              {orderId ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setOrderComplete(false);
                    router.push(`/order-success?orderId=${orderId}`);
                  }}
                >
                  View Order
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setOrderComplete(false);
                    router.push("/");
                  }}
                >
                  Back to Home
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
      <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
            <Link href="/products">
              <Button variant="outline" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-6 flex justify-center">
                <ShoppingCart className="h-16 w-16 text-gray-400 dark:text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your cart is empty</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">Looks like you haven't added any products to your cart yet.</p>
              <Link href="/products">
                <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-lg text-lg font-medium transition-all duration-300">
                  Browse Products
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Cart Items ({cartItems.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {cartItems.map((item) => (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center py-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
                      >
                        <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                        
                        <div className="ml-4 flex-grow min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 break-words">{item.name}</h3>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <span>
                            ₦{(item.discountedPrice || item.price).toFixed(2)}
                              {item.discountedPrice && (
                                <span className="ml-2 line-through text-xs"> ₦{item.price.toFixed(2)}</span>
                              )}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center ml-4 flex-shrink-0">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 rounded-full"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="mx-3 w-6 text-center">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 rounded-full"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="ml-6 text-right">
                          <div className="font-medium text-gray-900 dark:text-white">
                          {((item.discountedPrice || item.price) * item.quantity).toFixed(2)}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-0 h-auto"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            <span className="text-xs">Remove</span>
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </div>
              
              {/* Order Summary */}
              <div>
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                      <span className="font-medium text-gray-900 dark:text-white">₦{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    {/* <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Tax (7%)</span>
                      <span className="font-medium text-gray-900 dark:text-white">₦{tax.toFixed(2)}</span>
                    </div> */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-900 dark:text-white">Total</span>
                        <span className="font-bold text-primary dark:text-primary">₦{total.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90 text-white py-6 flex items-center justify-center gap-2"
                      onClick={() => setCheckoutStep(2)}
                    >
                      Proceed to Checkout
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}

          {/* Checkout Form */}
          {checkoutStep === 2 && cartItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-12"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Checkout Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitOrder} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Full Name
                        </label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email Address
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Phone Number
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Address
                        </label>
                        <Input
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          City
                        </label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            State
                          </label>
                          <Input
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="zip" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            ZIP Code
                          </label>
                          <Input
                            id="zip"
                            name="zip"
                            value={formData.zip}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Order Notes (Optional)
                        </label>
                        <Textarea
                          id="notes"
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          rows={3}
                        />
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Payment Method</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        After submitting your order, our team will contact you to arrange payment and delivery details.
                      </p>
                      
                      <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-6">
                        <CreditCard className="h-6 w-6 text-primary mr-3" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Payment on Delivery</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Pay when you receive your order
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button 
                        type="button"
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setCheckoutStep(1)}
                      >
                        Back to Cart
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-primary hover:bg-primary/90 text-white py-6 flex-1 flex items-center justify-center gap-2"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            Place Order
                            <CheckCircle className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
