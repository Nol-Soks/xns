import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@/generated/prisma/client";
const prisma = new PrismaClient({
  accelerateUrl: process.env.ACCELERATE_URL!,
});

type Credentials = {
  email: string;
  username: string;
  password: string;
};

type ResponseData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  if (req.method == "POST") {
    try {
      const { email, username, password } = req.body as Credentials;
      const hashedPassword = await bcrypt.hash(password, 9);
      const newuser = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
        },
      });
      return res.status(200).json({ message: "SignUp Successfull" });
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Signin failed " + (error as Error).message });
    }
  } else {
    return res.status(405).json({ message: "Invalid method" });
  }
}
