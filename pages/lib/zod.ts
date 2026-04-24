import { z } from "zod";

export const SignupSchema = z.object({
  email: z.email(),
  username: z.string(),
  password: z.string().min(8),
});

export const SigninSchema = z.object({
  email: z.email().optional(),
  username: z.string().optional(),
  password: z.string(),
});

export const OrdersSchema = z.object({
  userId: z.number(),
  symbol: z.string(),
  type: z.enum(["BUY", "SELL"]),
  price: z.number().positive(),
  quantity: z.number().positive(),
  status: z.enum(["Pending", "Filled", "Cancelled"]),
});

export const TradeSchema = z.object({
  userId: z.number(),
  orderId: z.number(),
  symbol: z.string(),
  type: z.enum(["BUY", "SELL"]),
  status: z.enum(["Filled", "Cancelled"]),
  price: z.number().positive(),
  quantity: z.number().positive(),
});
export const HistorySchema = z.object({
  userId: z.number(),
});
