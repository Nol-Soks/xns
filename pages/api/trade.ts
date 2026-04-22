import type { NextApiRequest, NextApiResponse } from "next";

import { PrismaClient, TradeHistory } from "@/generated/prisma/client";
const prisma = new PrismaClient({
  accelerateUrl: process.env.ACCELERATE_URL!,
});

type ResponseData<T> = {
  message: string;
  data?: T;
};
export default async function Trade(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData<TradeHistory[]>>,
) {
  if (req.method === "POST") {
    try {
      const { userId, orderId, symbol, type, status, price, quantity } =
        req.body;
      const addTrade = await prisma.tradeHistory.create({
        data: {
          userId,
          orderId,
          symbol,
          type,
          status,
          price,
          quantity,
        },
      });
      if (addTrade) {
        return res.status(200).json({
          message: "Succesfull added order to history",
        });
      }
    } catch (err) {
      return res.status(400).json({
        message: "Order addition Unsuccesfull " + (err as Error).message,
      });
    }
  } else if (req.method === "GET") {
    try {
      const { userId } = req.body;
      const getTradeHistory = await prisma.tradeHistory.findMany({
        where: {
          userId: userId,
        },
      });
      if (getTradeHistory) {
        return res.status(200).json({
          message: "Trade history fetched successfully",
          data: getTradeHistory,
        });
      }
    } catch (err) {
      res.status(400).json({ message: (err as Error).message });
    }
  } else {
    res.status(405).json({ message: "Wrong request method" });
  }
}
