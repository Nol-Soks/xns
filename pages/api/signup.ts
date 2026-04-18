import type { NextApiRequest, NextApiResponse } from "next";
type Credentials = {
  email: string;
  username: string;
  password: string;
};
type ResponseData = {
  message: string;
  credentials?: Credentials;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  if (req.method == "POST") {
    const { email, username, password } = req.body as Credentials;

    res.json({
      message: "Credentials recieved",
      credentials: { email, username, password },
    });
  } else {
    res.status(405).json({ message: "Invalid method" });
  }
  //res.status(200).json({ message: "Hello from Next.js!" });
}
