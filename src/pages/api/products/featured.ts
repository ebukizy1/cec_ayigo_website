import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebase-admin";
import { FieldPath } from "firebase-admin/firestore";

type ApiProduct = {
  id: string;
  name: string;
  description?: string;
  price: number;
  discountedPrice?: number;
  images: string[];
  category?: string;
  inStock: boolean;
  featured?: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt?: any;
  specifications?: Record<string, string>;
  features?: string[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ products?: ApiProduct[]; error?: string }>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const limitParam = Array.isArray(req.query.limit)
      ? req.query.limit[0]
      : req.query.limit;
    const limitCount = Math.min(Math.max(parseInt(limitParam || "6", 10), 1), 24);

    const productsRef = db.collection("products");
    const snapshot = await productsRef
      .where("featured", "==", true)
      .limit(limitCount)
      .get();

    const products: ApiProduct[] = snapshot.docs.map((doc) => {
      const data = doc.data() as Record<string, any>;
      return {
        id: doc.id,
        name: data.name || "",
        description: data.description || "",
        price: data.price || 0,
        discountedPrice: data.discountedPrice,
        images: data.images || [],
        category: data.category || "",
        inStock: data.inStock !== undefined ? data.inStock : true,
        featured: data.featured || false,
        rating: data.rating || 4.5,
        reviewCount: data.reviewCount || 0,
        createdAt: data.createdAt || null,
        specifications: data.specifications || {},
        features: data.features || [],
      };
    });

    return res.status(200).json({ products });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Internal Server Error" });
  }
}
