import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { adminDb } from '@/lib/firebaseAdmin'; // Make sure this points to your initialized Admin SDK

export async function POST(req: NextRequest) {
  console.log("-------- in signup route --------------");

  const formData = await req.formData();
  const username = formData.get("username")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!username || !email || !password) {
    return NextResponse.json({ error: "Missing required fields", status: 400 });
  }

  try {
    const userCollection = adminDb.collection("user");

    // Check for existing user
    const existingSnapshot = await userCollection.where("email", "==", email).limit(1).get();

    if (!existingSnapshot.empty) {
      return NextResponse.json({ error: "User already exists", status: 400 });
    }

    const hashedPassword = hashPassword(password);

    const newUser = {
      username,
      email,
      hashedPassword,
      role: "user",
      isVerfied: true,
      isAdmin: false,
    };

    const docRef = await userCollection.add(newUser);

    console.log("Document written with ID: ", docRef.id);

    return NextResponse.json({ data: "User added" });
  } catch (e) {
    console.error("Error adding user: ", e);
    return NextResponse.json({ error: "Server error", status: 500 });
  }
}
