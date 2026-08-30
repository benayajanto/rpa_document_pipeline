import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { apiClient, ApiError } from "@/lib/api-client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        try {
          const { token, user } = await apiClient.login(email, password);
          return {
            id: String(user.id),
            email: user.email,
            name: user.name,
            backendToken: token,
          };
        } catch (error) {
          if (error instanceof ApiError) return null;
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.backendToken = user.backendToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.backendToken = token.backendToken;
      return session;
    },
  },
});
