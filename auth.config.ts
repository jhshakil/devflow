import type { NextAuthConfig } from "next-auth";

// NOTE: This file is used in the Edge runtime (middleware).
// Do not import any Node.js-only modules or libraries that depend on them (like 'pg' or 'prisma').
// The 'providers' array must be present for NextAuth, but we keep it empty or
// add only edge-compatible providers here. Database-backed providers are added in lib/auth.ts.

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
