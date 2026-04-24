import type { NextApiRequest, NextApiResponse } from "next";

import bcrypt from "bcryptjs";
import { PrismaClient, User } from "@/generated/prisma/client";
import { SigninSchema } from "../lib/zod";
import { ApiResponse } from "../lib/response";
const prisma = new PrismaClient({
  accelerateUrl: process.env.ACCELERATE_URL!,
});
type Credentials = {
  email?: string;
  username?: string;
  password: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<User>>,
) {
  if (req.method == "POST") {
    try {
      const parsed = SigninSchema.parse(req.body);
      const { email, username, password } = parsed as Credentials;
      const user = email
        ? await prisma.user.findUnique({ where: { email } })
        : await prisma.user.findUnique({ where: { username } });
      if (!user) {
        return res.status(401).json({
          success: true,
          message: "Username/Email not found",
        });
      } else {
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return res.status(401).json({
            success: false,
            message: "Incorrect Password",
          });
        } else {
          return res
            .status(200)
            .json({ success: true, message: " SignIn Successul" });
        }
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "SignIn Unsuccessful " + (err as Error).message,
      });
    }
  } else {
    return res.status(405).json({
      success: false,
      message: "Invalid method",
    });
  }
  //res.status(200).json({ message: "Hello from Next.js!" });
}
