// types/next-auth.d.ts
// types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

// types/next-auth.d.ts

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      mobile?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    mobile?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    mobile?: string;
  }
}