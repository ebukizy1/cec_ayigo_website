import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebase-admin";

type R = { posts?: any[]; error?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<R>) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  try {
    const limitParam = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit;
    const limitCount = Math.min(Math.max(parseInt(limitParam || "3", 10), 1), 20);
    const snapshot = await db.collection("blogPosts").orderBy("date", "desc").limit(limitCount).get();
    const posts = snapshot.docs.map((doc) => {
      const d = doc.data() as Record<string, any>;
      return {
        id: doc.id,
        title: d.title || "",
        content: d.content || "",
        snippet: d.snippet || "",
        imageUrl: d.imageUrl || "",
        author: d.author || "",
        date: d.date || null,
        tags: d.tags || [],
      };
    });
    return res.status(200).json({ posts });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Internal Server Error" });
  }
}
