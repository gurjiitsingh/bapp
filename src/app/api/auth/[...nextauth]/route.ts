import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { adminDb } from "@/lib/firebaseAdmin"; // your firebase-admin instance
import { getDoc, doc } from "firebase-admin/firestore";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        // Example: check admin user from Firestore
        const userDoc = await getDoc(doc(adminDb, "users", credentials.email));
        const userData = userDoc.data();

        if (userData && userData.isAdmin && credentials.password === userData.hashedPassword) {
          return {
            id: userData.id,
            name: userData.username,
            email: userData.email,
            role: userData.role,
          };
        }

        // fallback: default admin
        if (credentials.email === "admin@example.com" && credentials.password === "123456") {
          return { id: "1", name: "Admin", email: credentials.email, role: "admin" };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt" },
});

// App Router requires exporting GET & POST
export const { GET, POST } = handlers;
