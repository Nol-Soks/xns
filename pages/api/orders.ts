import type { NextApiRequest, NextApiResponse } from "next";

import { Orders, PrismaClient } from "@/generated/prisma/client";
const prisma = new PrismaClient({
  accelerateUrl: process.env.ACCELERATE_URL!,
});

type ResponseData<T> = {
  message?: string;
  data?: T;
  error?: string;
};

async function getMarketPrice(symbol: string) {
  const price = 1; //hardcoding for now
  return price;
}

export default async function Trade(
  req: NextApiRequest,

  res: NextApiResponse<ResponseData<Orders[]>>,
) {
  if (req.method === "POST") {
    try {
      const { userId, symbol, type, quantity } = req.body;
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
        res.status(200).json({ message: "Order created Successfully" });
      }
    } catch (err) {
      res.status(400).json({ message: (err as Error).message });
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
        data: getOrder,
      });
    } catch (err) {
      res.status(400).json({ message: (err as Error).message });
    }
  } else {
    res.status(405).json({ message: "Wrong request method" });
  }
}
