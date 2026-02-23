import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebase-admin";

type R = { post?: any; error?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<R>) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  try {
    const { id } = req.query;
    if (!id || Array.isArray(id)) return res.status(400).json({ error: "Invalid id" });
    const snap = await db.collection("blogPosts").doc(id).get();
    if (!snap.exists) return res.status(404).json({ error: "Not found" });
    const d = snap.data() as Record<string, any>;
    const post = {
      id: snap.id,
      title: d.title || "",
      content: d.content || "",
      snippet: d.snippet || "",
      imageUrl: d.imageUrl || "",
      author: d.author || "",
      date: d.date || null,
      tags: d.tags || [],
    };
    return res.status(200).json({ post });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Internal Server Error" });
  }
}
