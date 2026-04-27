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
  const price = 1; //hardcoding for now
  return price;
}

export default async function Trade(
  req: NextApiRequest,

  res: NextApiResponse<ApiResponse<Orders[]>>,
) {
  if (req.method === "POST") {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid User" });
      }
      const parsed = OrdersSchema.parse(req.body);
      const { userId, symbol, type, quantity } = parsed;
      const calculatedPrice = await getMarketPrice(symbol);
      const addOrder = await prisma.orders.create({
        data: {
          userId,
          symbol,
          type,
          status: "Pending",
          price: calculatedPrice,
          quantity,
        },
      });
      if (addOrder) {
        res
          .status(200)
          .json({ success: true, message: "Order created Successfully" });
      }
    } catch (err) {
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  } else if (req.method === "GET") {
    try {
      const { userId } = req.body;
      const getOrder = await prisma.orders.findMany({
        where: {
          userId: userId,
        },
      });
      return res.status(200).json({
        success: true,
        message: "Order found",
        data: getOrder,
      });
    } catch (err) {
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  } else {
    res.status(405).json({ success: false, message: "Wrong request method" });
  }
}
