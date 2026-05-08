import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    // 1. Get groups
    const groupSnap = await adminDb.collection("modifierGroups").get();

    const groups = groupSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 2. Get items
    const itemSnap = await adminDb.collection("modifierItems").get();

    const items = itemSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 3. Combine
    const result = groups.map((group) => ({
      group,
      items: items.filter((item) => item.groupId === group.id),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("modifier-groups error:", error);
    return NextResponse.json([], { status: 500 });
  }
}