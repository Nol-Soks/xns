import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

export function authHandler(handler: Function) {
  return async function (res: NextApiResponse, req: NextApiRequest) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({
          message: "Unauthorized user",
        });
      } else {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        (req as any).user = decoded;
        return handler(req, res);
      }
    } catch {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
}
