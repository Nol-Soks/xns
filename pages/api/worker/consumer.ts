import { PrismaClient } from "@/generated/prisma/client";
import { MessageBatch } from "@cloudflare/workers-types";

interface QueueMessage {
  id: number;
  symbol: string;
  type: string;
  quantity: number;
}

interface env {
  DB: PrismaClient;
}

const exportConsumer = {
  async queue(batch: MessageBatch<QueueMessage>, env: env) {
    for (const msg of batch.messages) {
      try {
        const { id } = msg.body as QueueMessage;

        const order = await env.DB.orders.findUnique({
          where: { id: id },
        });

        console.log("Processing Order : ", order);
        await matchOrder(order);

        msg.ack();
      } catch {
        console.log("Error occured while de-queueing");
      }
    }
  },
};

export default exportConsumer;
