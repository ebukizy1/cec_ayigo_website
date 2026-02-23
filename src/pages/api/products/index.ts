import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebase-admin";

type R = { products?: any[]; error?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<R>) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  try {
    const snapshot = await db.collection("products").orderBy("createdAt", "desc").get();
    const products = snapshot.docs.map((doc) => {
      const d = doc.data() as Record<string, any>;
      return {
        id: doc.id,
        name: d.name || "",
        description: d.description || "",
        price: d.price || 0,
        discountedPrice: d.discountedPrice,
        images: d.images || [],
        category: d.category || "",
        inStock: d.inStock !== undefined ? d.inStock : true,
        featured: d.featured || false,
        createdAt: d.createdAt || null,
        features: d.features || [],
        specifications: d.specifications || {},
        rating: d.rating || 4.5,
        reviewCount: d.reviewCount || 0,
      };
    });
    return res.status(200).json({ products });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Internal Server Error" });
  }
}
