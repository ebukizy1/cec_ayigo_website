import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";

interface Order {
  id: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: any;
}

export function OrderNotification() {
  const router = useRouter();
  const [newOrders, setNewOrders] = useState<Order[]>([]);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Set up real-time listener for new orders
    const ordersQuery = query(
      collection(db, 'orders'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      
      // Check if there are new orders
      if (orders.length > 0) {
        setNewOrders(orders);
        setShowNotification(true);
        
        // Show toast notification for the newest order
        const latestOrder = orders[0];
        if (latestOrder && latestOrder.customerName) {
          toast.info(
            <div className='flex flex-col'>
              <span className='font-bold'>New Order Received!</span>
              <span>From: {latestOrder.customerName}</span>
              <span>Amount: ₦{latestOrder.total.toFixed(2)}</span>
              <Button 
                size='sm' 
                className='mt-2 bg-primary hover:bg-primary/90'
                onClick={() => {
                  router.push(`/admin/orders/${latestOrder.id}`);
                  toast.dismiss();
                }}
              >
                View Order
              </Button>
            </div>,
            {
              duration: 10000,
              icon: <Bell className='h-5 w-5 text-primary' />
            }
          );
        }
      }
    }, (error) => {
      console.error('Error listening to orders:', error);
    });

    return () => unsubscribe();
  }, [router]);

  const handleDismiss = () => {
    setShowNotification(false);
  };

  const handleViewAll = () => {
    router.push("/admin/dashboard?tab=orders");
    setShowNotification(false);
  };

  if (!showNotification || newOrders.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-primary p-3 flex items-center justify-between">
        <div className="flex items-center">
          <Bell className="h-5 w-5 text-white mr-2" />
          <h3 className="text-white font-medium">New Orders ({newOrders.length})</h3>
        </div>
        <button 
          className="text-white hover:text-gray-200"
          onClick={handleDismiss}
        >
          ×
        </button>
      </div>
      
      <div className="max-h-60 overflow-y-auto">
        {newOrders.map((order) => (
          <div 
            key={order.id}
            className="p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            onClick={() => router.push(`/admin/orders/${order.id}`)}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {order.customerName || "Customer"}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
              ₦{order.total?.toFixed(2) || "0.00"}
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {order.createdAt?.toDate().toLocaleString() || "Recent"}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 bg-gray-50 dark:bg-gray-700 text-center">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={handleViewAll}
        >
          View All Orders
        </Button>
      </div>
    </div>
  );
}