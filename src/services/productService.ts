import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc, query, where, limit, orderBy, addDoc, serverTimestamp, updateDoc, Timestamp } from "firebase/firestore";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  images: string[];
  category: string;
  inStock: boolean;
  featured?: boolean;
  createdAt: Timestamp;
  features: string[];
  specifications: Record<string, string>;
  rating?: number;
  reviewCount?: number;
}

export const productService = {
  async createProduct(productData: Omit<Product, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...productData,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  async getFeaturedProducts(limitCount = 6): Promise<Product[]> {
    try {
      console.log('Fetching featured products...');
      
      // Create a simple query first to avoid index issues
      const productsQuery = query(
        collection(db, 'products'),
        where('featured', '==', true),
        // orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(productsQuery);
      console.log(`Found ${snapshot.docs.length} featured products`);
      
      if (snapshot.empty) {
        console.log('No featured products found');
        return [];
      }
      
      // Process the data safely
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          description: data.description || '',
          price: data.price || 0,
          discountedPrice: data.discountedPrice,
          images: data.images || [],
          category: data.category || '',
          inStock: data.inStock !== undefined ? data.inStock : true,
          featured: data.featured || false,
          createdAt: data.createdAt,
          features: data.features || [],
          specifications: data.specifications || {},
          rating: data.rating || 4.5,
          reviewCount: data.reviewCount || 0
        } as Product;
      });
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error; // Throw the error to handle it in the component
    }
  },
  
  async getAllProducts(): Promise<Product[]> {
    try {
      const productsQuery = query(
        collection(db, 'products'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(productsQuery);
      
      if (snapshot.empty) {
        return [];
      }
      
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      return products;
    } catch (error) {
      console.error('Error fetching all products:', error);
      return [];
    }
  },
  
  async getProductById(id: string): Promise<Product | null> {
    try {
      const productDoc = await getDoc(doc(db, 'products', id));
      
      if (!productDoc.exists()) {
        return null;
      }
      
      return {
        id: productDoc.id,
        ...productDoc.data()
      } as Product;
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      return null;
    }
  },
  
  async getProductsByCategory(category: string, limitCount = 10): Promise<Product[]> {
    try {
      const productsQuery = query(
        collection(db, 'products'),
        where('category', '==', category),
        where('inStock', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(productsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
    } catch (error) {
      console.error(`Error fetching products in category ${category}:`, error);
      return [];
    }
  },

  async updateProduct(id: string, productData: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, {
        ...productData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }
};