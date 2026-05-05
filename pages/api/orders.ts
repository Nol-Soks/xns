import type { NextApiRequest, NextApiResponse } from "next";
import { Orders, PrismaClient } from "@/generated/prisma/client";
import { OrdersSchema } from "../lib/zod";
import { ApiResponse } from "../lib/response";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

const prisma = new PrismaClient({
  accelerateUrl: process.env.ACCELERATE_URL!,
});

async function getMarketPrice(symbol: string) {
  return 1;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Orders[]>>,
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ success: false, message: "Invalid User" });
  }

  try {
    if (req.method === "POST") {
      const parsed = OrdersSchema.parse(req.body);
      const { symbol, type, quantity } = parsed;
      const calculatedPrice = await getMarketPrice(symbol);

      const newOrder = await prisma.orders.create({
        data: {
          userId: session.user.id,
          symbol,
          type,
          status: "Pending",
          price: calculatedPrice,
          quantity,
        },
      });

      // 🔑 Push into Cloudflare Queue
      // Wrangler.toml must bind ORDERS to your queue
      await (globalThis as any).env.ORDERS.send(JSON.stringify(newOrder));

      return res.status(200).json({
        success: true,
        message: "Order created and queued successfully",
        data: [newOrder],
      });
    }

    if (req.method === "GET") {
      const orders = await prisma.orders.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json({
        success: true,
        message: "Orders retrieved successfully",
        data: orders,
      });
    }

    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: (err as Error).message });
  }
}
