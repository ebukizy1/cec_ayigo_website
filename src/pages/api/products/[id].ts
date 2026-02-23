import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebase-admin";

type R = { product?: any; error?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<R>) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  try {
    const { id } = req.query;
    if (!id || Array.isArray(id)) return res.status(400).json({ error: "Invalid id" });
    const snap = await db.collection("products").doc(id).get();
    if (!snap.exists) return res.status(404).json({ error: "Not found" });
    const d = snap.data() as Record<string, any>;
    const product = {
      id: snap.id,
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
    return res.status(200).json({ product });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Internal Server Error" });
  }
}
