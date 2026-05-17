import type { NextApiRequest, NextApiResponse } from "next";

import { PrismaClient, TradeHistory, Orders } from "@/generated/prisma/client";
import { TradeSchema } from "../lib/zod";
import { ApiResponse } from "../lib/response";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
const prisma = new PrismaClient({
  accelerateUrl: process.env.ACCELERATE_URL!,
});

// type ResponseData = {
//   message: string;
//   // data?: T;
// };
//
export default async function Trade(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<TradeHistory>>,
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  if (req.method === "POST") {
    try {
      const parsed = TradeSchema.parse(req.body);
      const { orderId, symbol, type, status, price, quantity } = parsed;
      const [updateOrder, addTrade] = await prisma.$transaction([
        prisma.orders.update({
          where: { id: orderId },
          data: { status },
        }),
        prisma.tradeHistory.create({
          data: {
            userId: session.user.id,
            orderId,
            symbol,
            type,
            status,
            price,
            quantity,
          },
        }),
      ]);
      if (addTrade && updateOrder) {
        return res.status(200).json({
          success: true,
          message: "Succesfull added order to history , status updated",
        });
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Order addition Unsuccesfull " + (err as Error).message,
      });
    }
  } else {
    res.status(405).json({
      success: false,
      message: "Wrong request method",
    });
  }
}
