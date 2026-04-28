import { PrismaClient } from "@/generated/prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth from "next-auth";
declare module "next-auth" {
  interface User {
    id: number;
    email: string;
  }
  interface Session {
    user: {
      id: number;
      email: string;
    };
  }
}

const prisma = new PrismaClient({
  accelerateUrl: process.env.ACCELERATE_URL!,
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        usernamemail: { label: "Email or username ", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user =
          (await prisma.user.findUnique({
            where: { email: credentials?.usernamemail },
          })) ||
          (await prisma.user.findUnique({
            where: { username: credentials?.usernamemail },
          }));
        if (!user) return null;
        const valid = await bcrypt.compare(
          credentials!.password,
          user.password,
        );
        if (!valid) return null;
        return { id: user.id, email: user.email };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.JWT_SECRET,
};

export default NextAuth(authOptions);
