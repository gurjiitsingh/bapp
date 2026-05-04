import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase"; // your firebase config
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";

// ✅ GET: fetch mapping for a product
export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId");

  if (!productId) {
    return NextResponse.json([]);
  }

  const q = query(
    collection(db, "productModifiers"),
    where("productId", "==", productId)
  );

  const snap = await getDocs(q);

  const data = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return NextResponse.json(data);
}

// ✅ POST: save mappings (replace all)
export async function POST(req: NextRequest) {
  const { productId, groupIds } = await req.json();

  if (!productId) {
    return NextResponse.json({ error: "Missing productId" });
  }

  // 🔥 1. delete old mappings
  const oldQuery = query(
    collection(db, "productModifiers"),
    where("productId", "==", productId)
  );

  const oldSnap = await getDocs(oldQuery);

  for (const docItem of oldSnap.docs) {
    await deleteDoc(docItem.ref);
  }

  // 🔥 2. insert new mappings
  const promises = groupIds.map((groupId: string) =>
    addDoc(collection(db, "productModifiers"), {
      productId,
      groupId,
    })
  );

  await Promise.all(promises);

  return NextResponse.json({ success: true });
}