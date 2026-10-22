import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { adminDb } from "./lib/firebaseAdmin";

export const authConfig = {
  providers: [
    Credentials({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email address",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();

        // Do not trim passwords; whitespace may be intentional.
        const password = String(credentials?.password ?? "");

        if (!email || !password) {
          return null;
        }

        try {
          const snapshot = await adminDb
            .collection("users")
            .where("email", "==", email)
            .limit(1)
            .get();

          if (snapshot.empty) {
            return null;
          }

          const doc = snapshot.docs[0];
          const user = doc.data();

          if (
            !user.hashedPassword ||
            user.active === false ||
            ["inactive", "disabled", "suspended"].includes(
              String(user.status ?? "").toLowerCase()
            )
          ) {
            return null;
          }

          const isValid = await bcrypt.compare(
            password,
            user.hashedPassword
          );

          if (!isValid) {
            return null;
          }

          // Preserve the existing role for staff and customers.
          return {
            id: doc.id,
            name: user.fullName ?? user.username ?? "",
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("[Auth] Credentials authorization failed:", error);
          return null;
        }
      },
    }),
  ],
} satisfies NextAuthConfig;