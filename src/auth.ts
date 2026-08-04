import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

export const authOptions = {
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await db.select().from(users).where(eq(users.email, credentials.email as string));

          if (user.length === 0) {
            return null;
          }

          const isValid = await compare(credentials.password as string, user[0].password);

          if (!isValid) {
            return null;
          }

          if (!user[0].isActive) {
            throw new Error("Account is disabled");
          }

          return {
            id: user[0].id.toString(),
            email: user[0].email,
            name: user[0].name,
            role: user[0].role,
            branchId: user[0].branchId,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role;
        token.branchId = user.branchId;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.branchId = token.branchId as number;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export const auth = handler.auth;
export const signIn = handler.signIn;
export const signOut = handler.signOut;
export const handlers = handler;