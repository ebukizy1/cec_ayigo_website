
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

export interface CartItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  discountedPrice?: number;
  imageUrl: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export const cartService = {
  async createAnonymousCart(): Promise<string> {
    try {
      const cartRef = doc(collection(db, "carts"));
      const newCart: Omit<Cart, "id"> = {
        items: [],
        total: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(cartRef, newCart);
      return cartRef.id;
    } catch (error) {
      console.error("Error creating anonymous cart:", error);
      throw error;
    }
  },
  
  async getCart(cartId: string): Promise<Cart | null> {
    try {
      const cartDoc = await getDoc(doc(db, "carts", cartId));
      
      if (!cartDoc.exists()) {
        return null;
      }
      
      return {
        id: cartDoc.id,
        ...cartDoc.data()
      } as Cart;
    } catch (error) {
      console.error(`Error fetching cart with ID ${cartId}:`, error);
      return null;
    }
  },
  
  async addItemToCart(cartId: string, item: CartItem): Promise<void> {
    try {
      const cartRef = doc(db, "carts", cartId);
      const cartDoc = await getDoc(cartRef);
      
      if (!cartDoc.exists()) {
        throw new Error(`Cart with ID ${cartId} does not exist`);
      }
      
      const cart = cartDoc.data() as Omit<Cart, "id">;
      const existingItemIndex = cart.items.findIndex(i => i.productId === item.productId);
      
      if (existingItemIndex >= 0) {
        // Update quantity if item already exists
        cart.items[existingItemIndex].quantity += item.quantity;
      } else {
        // Add new item
        cart.items.push(item);
      }
      
      // Recalculate total
      cart.total = cart.items.reduce((sum, item) => {
        const price = item.discountedPrice || item.price;
        return sum + (price * item.quantity);
      }, 0);
      
      cart.updatedAt = new Date();
      
      await updateDoc(cartRef, cart);
    } catch (error) {
      console.error(`Error adding item to cart ${cartId}:`, error);
      throw error;
    }
  },
  
  async removeItemFromCart(cartId: string, productId: string): Promise<void> {
    try {
      const cartRef = doc(db, "carts", cartId);
      const cartDoc = await getDoc(cartRef);
      
      if (!cartDoc.exists()) {
        throw new Error(`Cart with ID ${cartId} does not exist`);
      }
      
      const cart = cartDoc.data() as Omit<Cart, "id">;
      cart.items = cart.items.filter(item => item.productId !== productId);
      
      // Recalculate total
      cart.total = cart.items.reduce((sum, item) => {
        const price = item.discountedPrice || item.price;
        return sum + (price * item.quantity);
      }, 0);
      
      cart.updatedAt = new Date();
      
      await updateDoc(cartRef, cart);
    } catch (error) {
      console.error(`Error removing item from cart ${cartId}:`, error);
      throw error;
    }
  },
  
  async updateItemQuantity(cartId: string, productId: string, quantity: number): Promise<void> {
    try {
      if (quantity < 1) {
        return this.removeItemFromCart(cartId, productId);
      }
      
      const cartRef = doc(db, "carts", cartId);
      const cartDoc = await getDoc(cartRef);
      
      if (!cartDoc.exists()) {
        throw new Error(`Cart with ID ${cartId} does not exist`);
      }
      
      const cart = cartDoc.data() as Omit<Cart, "id">;
      const itemIndex = cart.items.findIndex(item => item.productId === productId);
      
      if (itemIndex === -1) {
        throw new Error(`Item with product ID ${productId} not found in cart`);
      }
      
      cart.items[itemIndex].quantity = quantity;
      
      // Recalculate total
      cart.total = cart.items.reduce((sum, item) => {
        const price = item.discountedPrice || item.price;
        return sum + (price * item.quantity);
      }, 0);
      
      cart.updatedAt = new Date();
      
      await updateDoc(cartRef, cart);
    } catch (error) {
      console.error(`Error updating item quantity in cart ${cartId}:`, error);
      throw error;
    }
  },
  
  async clearCart(cartId: string): Promise<void> {
    try {
      const cartRef = doc(db, "carts", cartId);
      
      await updateDoc(cartRef, {
        items: [],
        total: 0,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error(`Error clearing cart ${cartId}:`, error);
      throw error;
    }
  },
  
  async deleteCart(cartId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "carts", cartId));
    } catch (error) {
      console.error(`Error deleting cart ${cartId}:`, error);
      throw error;
    }
  }
};
