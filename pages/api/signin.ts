import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "../../generated/prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

type Credentials = {
  email?: string;
  username?: string;
  password: string;
};
type ResponseData = {
  message: string;
  credentials?: Credentials;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  if (req.method == "POST") {
    try {
      const { email, username, password } = req.body as Credentials;
      const user = email
        ? await prisma.user.findUnique({ where: { email } })
        : await prisma.user.findUnique({ where: { username } });
      if (!user) {
        return res.status(401).json({ message: "Username/Email not found" });
      } else {
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return res.status(401).json({ message: "Incorrect Password" });
        } else {
          return res.status(200).json({ message: " SignIn Successul" });
        }
      }
    } catch (err) {
      return res
        .status(400)
        .json({ message: "SignIn Unsuccessful " + (err as Error).message });
    }
  } else {
    return res.status(405).json({ message: "Invalid method" });
  }
  //res.status(200).json({ message: "Hello from Next.js!" });
}
