import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, query, orderBy, limit } from 'firebase/firestore';
import { toast } from 'sonner';
import { Package, Users, DollarSign, ShoppingCart, PlusCircle, Edit, Trash2, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Order {
  id: string;
  total: number;
  customerEmail: string;
  customerName: string;
  status: string;
  createdAt: any;
}

interface Product {
  id: string;
  name: string;
  price: number;
  discountedPrice?: number;
  category: string;
  inStock: boolean;
  featured: boolean;
}

interface BlogPost {
  id: string;
  title: string;
  author: string;
  date: any;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0
  });
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'product' | 'blog' }>({ id: '', type: 'product' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // User is not logged in, redirect to login page
        router.push('/admin/login');
      } else {
        // User is logged in, fetch data
        fetchData();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const fetchData = async () => {
    try {
      // Fetch products
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const productsData = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);

      // Fetch orders
      const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
      
      // Count new/pending orders
      const pendingOrders = ordersData.filter(order => order.status === 'pending');
      setNewOrdersCount(pendingOrders.length);

      // Fetch blog posts
      const blogPostsQuery = query(collection(db, 'blogPosts'), orderBy('date', 'desc'));
      const blogPostsSnapshot = await getDocs(blogPostsQuery);
      const blogPostsData = blogPostsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BlogPost[];
      setBlogPosts(blogPostsData);

      // Calculate stats
      const totalRevenue = ordersData.reduce((sum, order) => sum + (order.total || 0), 0);
      
      setStats({
        totalProducts: productsData.length,
        totalOrders: ordersData.length,
        totalRevenue,
        totalCustomers: new Set(ordersData.map(order => order.customerEmail || '')).size
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/admin/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  const toggleFeatured = async (productId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'products', productId), {
        featured: !currentStatus
      });
      
      // Update local state
      setProducts(products.map(product => 
        product.id === productId 
          ? { ...product, featured: !currentStatus } 
          : product
      ));
      
      toast.success(`Product ${!currentStatus ? 'added to' : 'removed from'} featured products`);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const confirmDelete = (id: string, type: 'product' | 'blog') => {
    setItemToDelete({ id, type });
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      if (itemToDelete.type === 'product') {
        await deleteDoc(doc(db, 'products', itemToDelete.id));
        setProducts(products.filter(product => product.id !== itemToDelete.id));
        toast.success('Product deleted successfully');
      } else {
        await deleteDoc(doc(db, 'blogPosts', itemToDelete.id));
        setBlogPosts(blogPosts.filter(post => post.id !== itemToDelete.id));
        toast.success('Blog post deleted successfully');
      }
      
      fetchData(); // Refresh the data after deletion
    } catch (error) {
      console.error(`Error deleting ${itemToDelete.type}:`, error);
      toast.error(`Failed to delete ${itemToDelete.type}`);
    } finally {
      setDeleteConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
          <p className='mt-4 text-gray-600 dark:text-gray-400'>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard | Emax-Electrical - Shop Easy</title>
        <meta name='description' content='Admin dashboard for Cec Shop Easy' />
        <meta name='robots' content='noindex, nofollow' />
      </Head>

      <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
        <header className='bg-white dark:bg-gray-800 shadow-sm'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center'>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Admin Dashboard</h1>
            <Button variant='ghost' onClick={handleLogout} className='flex items-center gap-2'>
              <LogOut className='h-4 w-4' />
              Logout
            </Button>
          </div>
        </header>

        <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            <Card>
              <CardContent className='p-6 flex items-center'>
                <div className='rounded-full p-3 bg-blue-100 dark:bg-blue-900 mr-4'>
                  <Package className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Total Products</p>
                  <h3 className='text-2xl font-bold text-gray-900 dark:text-white'>{stats.totalProducts}</h3>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className='p-6 flex items-center'>
                <div className='rounded-full p-3 bg-green-100 dark:bg-green-900 mr-4'>
                  <ShoppingCart className='h-6 w-6 text-green-600 dark:text-green-400' />
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Total Orders</p>
                  <h3 className='text-2xl font-bold text-gray-900 dark:text-white'>{stats.totalOrders}</h3>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className='p-6 flex items-center'>
                <div className='rounded-full p-3 bg-purple-100 dark:bg-purple-900 mr-4'>
                  <Users className='h-6 w-6 text-purple-600 dark:text-purple-400' />
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Total Customers</p>
                  <h3 className='text-2xl font-bold text-gray-900 dark:text-white'>{stats.totalCustomers}</h3>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className='p-6 flex items-center'>
                <div className='rounded-full p-3 bg-amber-100 dark:bg-amber-900 mr-4'>
                  <DollarSign className='h-6 w-6 text-amber-600 dark:text-amber-400' />
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Total Revenue</p>
                  <h3 className='text-2xl font-bold text-gray-900 dark:text-white'>₦{stats.totalRevenue.toFixed(2)}</h3>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue='products' className='space-y-6'>
            <TabsList className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 rounded-lg'>
              <TabsTrigger value='products'>Products</TabsTrigger>
              <TabsTrigger value='orders'>Orders</TabsTrigger>
              <TabsTrigger value='customers'>Customers</TabsTrigger>
              <TabsTrigger value='settings'>Settings</TabsTrigger>
              <TabsTrigger value='blog'>Blog Posts</TabsTrigger>
            </TabsList>
            
            <TabsContent value='products' className='space-y-6'>
              <div className='flex justify-between items-center'>
                <h2 className='text-xl font-bold text-gray-900 dark:text-white'>Manage Products</h2>
                <Link href='/admin/products/new'>
                  <Button className='bg-primary hover:bg-primary/90 flex items-center gap-2'>
                    <PlusCircle className='h-4 w-4' />
                    Add New Product
                  </Button>
                </Link>
              </div>
              
              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-lg'>Product List</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='overflow-x-auto'>
                    <table className='w-full text-sm text-left'>
                      <thead className='text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800'>
                        <tr>
                          <th className='px-6 py-3'>Product</th>
                          <th className='px-6 py-3'>Price</th>
                          <th className='px-6 py-3'>Category</th>
                          <th className='px-6 py-3'>Status</th>
                          <th className='px-6 py-3'>Featured</th>
                          <th className='px-6 py-3'>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.length > 0 ? (
                          products.map((product) => (
                            <tr key={product.id} className='bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700'>
                              <td className='px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap'>
                                {product.name}
                              </td>
                              <td className='px-6 py-4'>
                              ₦{product.discountedPrice || product.price}
                              </td>
                              <td className='px-6 py-4'>
                                {product.category}
                              </td>
                              <td className='px-6 py-4'>
                                <span className={`px-2 py-1 rounded-full text-xs ${product.inStock ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                                </span>
                              </td>
                              <td className='px-6 py-4'>
                                <Button 
                                  variant={product.featured ? 'default' : 'outline'} 
                                  size='sm'
                                  onClick={() => toggleFeatured(product.id, product.featured)}
                                  className={product.featured ? 'bg-primary text-white' : 'border-gray-300 text-gray-700 dark:text-gray-300'}
                                >
                                  {product.featured ? 'Featured' : 'Not Featured'}
                                </Button>
                              </td>
                              <td className='px-6 py-4'>
                                <div className='flex space-x-2'>
                                  <Button 
                                    variant='outline' 
                                    size='sm' 
                                    className='h-8 w-8 p-0'
                                    onClick={() => router.push(`/admin/products/edit/${product.id}`)}
                                  >
                                    <Edit className='h-4 w-4' />
                                  </Button>
                                  <Button 
                                    variant='outline' 
                                    size='sm' 
                                    className='h-8 w-8 p-0 text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20'
                                    onClick={() => confirmDelete(product.id, 'product')}
                                  >
                                    <Trash2 className='h-4 w-4' />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className='bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700'>
                            <td colSpan={6} className='px-6 py-4 text-center text-gray-500 dark:text-gray-400'>
                              No products found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value='orders' className='space-y-6'>
              <h2 className='text-xl font-bold text-gray-900 dark:text-white'>Recent Orders</h2>
              
              <Card>
                <CardContent className='p-6'>
                  <div className='overflow-x-auto'>
                    <table className='w-full text-sm text-left'>
                      <thead className='text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800'>
                        <tr>
                          <th className='px-6 py-3'>Order ID</th>
                          <th className='px-6 py-3'>Customer</th>
                          <th className='px-6 py-3'>Date</th>
                          <th className='px-6 py-3'>Total</th>
                          <th className='px-6 py-3'>Status</th>
                          <th className='px-6 py-3'>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.length > 0 ? (
                          orders.map((order) => (
                            <tr key={order.id} className='bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700'>
                              <td className='px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap'>
                                #{order.id.slice(0, 8)}
                              </td>
                              <td className='px-6 py-4'>
                                {order.customerName || order.customerEmail}
                              </td>
                              <td className='px-6 py-4'>
                                {order.createdAt?.toDate ? 
                                  format(order.createdAt.toDate(), 'MMM dd, yyyy') : 
                                  'N/A'}
                              </td>
                              <td className='px-6 py-4'>
                              ₦{order.total?.toFixed(2) || '0.00'}
                              </td>
                              <td className='px-6 py-4'>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  order.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                                  order.status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                }`}>
                                  {order.status || 'Pending'}
                                </span>
                              </td>
                              <td className='px-6 py-4'>
                                <Link href={`/admin/orders/${order.id}`}>
                                  <Button variant='outline' size='sm'>
                                    View Details
                                  </Button>
                                </Link>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className='bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700'>
                            <td colSpan={6} className='px-6 py-4 text-center text-gray-500 dark:text-gray-400'>
                              No orders found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value='customers' className='space-y-6'>
              <h2 className='text-xl font-bold text-gray-900 dark:text-white'>Customer Management</h2>
              <p className='text-gray-600 dark:text-gray-400'>Customer management features coming soon.</p>
            </TabsContent>
            
            <TabsContent value='settings' className='space-y-6'>
              <h2 className='text-xl font-bold text-gray-900 dark:text-white'>Store Settings</h2>
              <p className='text-gray-600 dark:text-gray-400'>Store settings features coming soon.</p>
            </TabsContent>

            <TabsContent value='blog' className='space-y-6'>
              <div className='flex justify-between items-center'>
                <h2 className='text-xl font-bold text-gray-900 dark:text-white'>Manage Blog Posts</h2>
                <Link href='/admin/blogs/new'>
                  <Button className='bg-primary hover:bg-primary/90 flex items-center gap-2'>
                    <PlusCircle className='h-4 w-4' />
                    Add New Blog Post
                  </Button>
                </Link>
              </div>
              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-lg'>Blog Post List</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='overflow-x-auto'>
                    <table className='w-full text-sm text-left'>
                      <thead className='text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800'>
                        <tr>
                          <th className='px-6 py-3'>Title</th>
                          <th className='px-6 py-3'>Author</th>
                          <th className='px-6 py-3'>Date</th>
                          <th className='px-6 py-3'>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {blogPosts.length > 0 ? (
                          blogPosts.map((post) => (
                            <tr key={post.id} className='bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700'>
                              <td className='px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap'>
                                {post.title}
                              </td>
                              <td className='px-6 py-4'>
                                {post.author}
                              </td>
                              <td className='px-6 py-4'>
                                {post.date?.toDate ? 
                                  format(post.date.toDate(), 'MMM dd, yyyy') : 
                                  'N/A'}
                              </td>
                              <td className='px-6 py-4'>
                                <div className='flex space-x-2'>
                                  <Button 
                                    variant='outline' 
                                    size='sm' 
                                    className='h-8 w-8 p-0'
                                    onClick={() => router.push(`/admin/blogs/edit/${post.id}`)}
                                  >
                                    <Edit className='h-4 w-4' />
                                  </Button>
                                  <Button 
                                    variant='outline' 
                                    size='sm' 
                                    className='h-8 w-8 p-0 text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20'
                                    onClick={() => confirmDelete(post.id, 'blog')}
                                  >
                                    <Trash2 className='h-4 w-4' />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className='bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700'>
                            <td colSpan={4} className='px-6 py-4 text-center text-gray-500 dark:text-gray-400'>
                              No blog posts found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {itemToDelete.type}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className='bg-red-500 hover:bg-red-600'>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}