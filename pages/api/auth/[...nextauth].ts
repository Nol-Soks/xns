import { PrismaClient } from "@/generated/prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email },
        });
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
