import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Totals {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export default function OrderSuccessPage() {
  const router = useRouter();
  const { orderId } = router.query as { orderId?: string };
  const [totals, setTotals] = useState<Totals | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("lastOrder");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.totals) setTotals(parsed.totals as Totals);
      }
    } catch {}
  }, []);

  return (
    <>
      <Head>
        <title>Order Success | Cec - Shop Easy</title>
        <meta name="description" content="Your order has been placed successfully" />
      </Head>
      <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="mb-8 flex justify-center">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-6">
                <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Order Placed Successfully
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Thank you for your order. Your order has been received and is being processed.
            </p>
            {orderId && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Reference: <span className="font-semibold text-gray-900 dark:text-white">{orderId}</span>
              </p>
            )}
            {totals && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8 text-left">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="font-medium text-gray-900 dark:text-white">₦{totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {totals.shipping === 0 ? "Free" : `₦${totals.shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tax</span>
                    <span className="font-medium text-gray-900 dark:text-white">₦{totals.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-900 dark:text-white">Total</span>
                      <span className="font-bold text-primary dark:text-primary">₦{totals.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/products">
                <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-lg text-lg font-medium">
                  Continue Shopping
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="px-8 py-6 rounded-lg text-lg font-medium">
                  Back to Home
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

