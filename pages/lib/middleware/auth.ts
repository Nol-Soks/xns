/*
// ===============================
// AUTH FUNDAMENTALS REFERENCE FILE
// ===============================

// 1. Types
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma"; // adjust path to your prisma client

// Custom type: adds `user` to the request object
export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: number;
    email: string;
  };
}

// 2. Middleware: verifies JWT and attaches payload to req.user
export function withAuth<T>(
  handler: (req: AuthenticatedRequest, res: NextApiResponse<T>) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse<T>) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "No token provided" } as any);
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthenticatedRequest["user"];
      (req as AuthenticatedRequest).user = decoded;

      return handler(req as AuthenticatedRequest, res);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" } as any);
    }
  };
}

// 3. Public route: signup (uses req.body)
export async function signup(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { email, username, password } = req.body;

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Save user
      const user = await prisma.user.create({
        data: { email, username, password: hashedPassword },
      });

      return res.status(201).json({ success: true, message: "User created", data: user });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Signup failed", error: (err as Error).message });
    }
  } else {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
}

// 4. Public route: signin (issues JWT)
export async function signin(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(401).json({ message: "Invalid credentials" });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ message: "Invalid credentials" });

      // Issue JWT with payload
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
      );

      return res.status(200).json({ success: true, token });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Signin failed", error: (err as Error).message });
    }
  } else {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
}

// 5. Protected route: orders (uses req.user.id)
export const orders = withAuth(async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const orders = await prisma.orders.findMany({
        where: { userId: req.user!.id }, // ✅ verified from JWT
      });

      return res.status(200).json({
        success: true,
        message: "Orders fetched successfully",
        data: orders,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch orders",
        error: (err as Error).message,
      });
    }
  } else {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
});

// ===============================
// NOTES:
// - Signup/signin use req.body (public).
// - Signin issues JWT with payload { id, email }.
// - Middleware verifies JWT and attaches payload to req.user.
// - Protected routes (orders/trade/history) use req.user.id.
// - This file is for LEARNING ONLY. In production, use NextAuth.js.
// ===============================

*/
