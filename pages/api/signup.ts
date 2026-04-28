import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { PrismaClient, User } from "@/generated/prisma/client";
import { SignupSchema } from "../lib/zod";
import { ApiResponse } from "../lib/response";
const prisma = new PrismaClient({
  accelerateUrl: process.env.ACCELERATE_URL!,
});

type Credentials = {
  email: string;
  username: string;
  password: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<User>>,
) {
  if (req.method == "POST") {
    try {
      const parsed = SignupSchema.parse(req.body);
      const { email, username, password } = parsed as Credentials;
      const hashedPassword = await bcrypt.hash(password, 9);
      const newuser = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
        },
      });
      return res.status(200).json({
        success: true,
        message: "SignUp Successfull",
      });
    } catch (e) {
      console.log(e);
      return res.status(400).json({
        success: false,
        message: "Signup failed ",
      });
    }
  } else {
    return res.status(405).json({ success: false, message: "Invalid method" });
  }
}
