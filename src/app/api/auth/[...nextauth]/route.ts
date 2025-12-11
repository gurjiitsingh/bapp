import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "@/lib/auth";
import { adminDb } from "@/lib/firebaseAdmin"; // Admin SDK Firestore instance
import { DefaultSession, User } from "next-auth";
import { JWT } from "next-auth/jwt";

const handler = NextAuth({
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials: any): Promise<any> {
        const { email, password } = credentials;

        const userSnap = await adminDb
          .collection("user")
          .where("email", "==", email)
          .limit(1)
          .get();

        if (userSnap.empty) {
          throw new Error("No user found!");
        }

        const doc = userSnap.docs[0];
        const current_user = doc.data();
        const current_id = doc.id;

        const isVaildPass = await verifyPassword(
          password,
          current_user.hashedPassword
        );

        if (!isVaildPass) {
          throw new Error("Wrong Credentials");
        }

        return {
          id: current_id,
          name: current_user.username,
          role: current_user.role,
          email: current_user.email,
        };
      },
    }),
  ],

  callbacks: {
    async signIn() {
      return true;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },

    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token;
    },

    async session({
      session,
      token,
    }: {
      session: DefaultSession;
      token: JWT;
    }) {
      session.user = token.user as User;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
