import { PrismaClient, Orders } from "@/generated/prisma/client";
import { MessageBatch } from "@cloudflare/workers-types";

interface QueueMessage {
  id: number;
  symbol: string;
  type: string;
  quantity: number;
  price: number;
}

interface env {
  DB: PrismaClient;
}

async function matchOrder(order: Orders, env: env) {
  const oppositeType = order.type === "BUY" ? "SELL" : "BUY";
  const matches = await env.DB.orders.findMany({
    where: {
      type: oppositeType,
      symbol: order.symbol,
      status: { in: ["OPEN", "PARTIAL"] },
      price: order.type === "BUY" ? { lte: order.price } : { gte: order.price },
    },
    orderBy: { createdAt: "asc" },
  });

  for (const match of matches) {
    if (order.quantity <= 0) break;
    const tradeQuantity = Math.min(order.quantity, match.quantity);
    await env.DB.tradeHistory.create({
      data: {
        tradeGroupId,
        userId: order.type === "BUY" ? order.userId : match.userId,
        orderId: order.type === "BUY" ? order.id : match.id,
        symbol: order.symbol,
        type: "BUY",
        status: tradeQty === order.quantity ? "FILLED" : "PARTIAL",
        price: match.price,
        quantity: tradeQty,
      },
    });

    await env.DB.tradeHistory.create({
      data: {
        tradeGroupId,
        userId: order.type === "SELL" ? order.userId : match.userId,
        orderId: order.type === "SELL" ? order.id : match.id,
        symbol: order.symbol,
        type: "SELL",
        status: tradeQty === match.quantity ? "FILLED" : "PARTIAL",
        price: match.price,
        quantity: tradeQty,
      },
    });

    await env.DB.orders.update({
      where: { id: match.id },
      data: {
        quantity: match.quantity - tradeQty,
        status: match.quantity - tradeQty === 0 ? "FILLED" : "PARTIAL",
      },
    });

    remainingQty -= tradeQty;
  }

  await env.DB.orders.update({
    where: { id: order.id },
    data: {
      quantity: remainingQty,
      status: remainingQty === 0 ? "FILLED" : "PARTIAL",
    },
  });
}

const exportConsumer = {
  async queue(batch: MessageBatch<QueueMessage>, env: env) {
    for (const msg of batch.messages) {
      try {
        const { id } = msg.body as QueueMessage;

        const order = await env.DB.orders.findUnique({
          where: { id: id },
        });
        if (!order) {
          msg.ack();
          continue;
        }
        console.log("Processing Order : ", order);
        await matchOrder(order, env);

        msg.ack();
      } catch {
        console.log("Error occured while de-queueing");
      }
    }
  },
};

export default exportConsumer;
