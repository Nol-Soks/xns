import { NextApiRequest, NextApiResponse } from "next";

import { PrismaClient, TradeHistory } from "@/generated/prisma/client";
import { HistorySchema } from "../lib/zod";
import { ApiResponse } from "../lib/response";
const prisma = new PrismaClient({
  accelerateUrl: process.env.ACCELERATE_URL!,
});

export default async function History(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<TradeHistory[]>>,
) {
  if (req.method === "GET") {
    try {
      const parsed = HistorySchema.parse(req.body);
      const { userId } = parsed;
      const getTradeHistory = await prisma.tradeHistory.findMany({
        where: {
          userId: userId,
        },
      });
      return res.status(200).json({
        success: true,
        message: "history fetched successfully",
        data: getTradeHistory,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: (err as Error).message,
        data: [],
      });
    }
  } else {
    return res.status(405).json({
      success: false,
      message: "Wrong request type ",
      data: [],
    });
  }
}
