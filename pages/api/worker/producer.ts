import { Queue } from "@cloudflare/workers-types";
interface Order {
  id: number;
  symbol: string;
  type: string;
  quantity: number;
}

interface env {
  ORDERS: Queue<Order>;
}

const exportProducer = {
  async fetch(request: Request, env: env) {
    if (request.method === "POST") {
      const order = await request.json();
      await env.ORDERS.send(order);
      return new Response("Queued");
    }
    return new Response("Invalid Request", { status: 405 });
  },
};

export default exportProducer;
