import { NextFunction, Request, Response } from "express";
import { getUserData, IUserToken } from "../utils/jwt";

// Modifikasi Argumen Request
export interface IReqUser extends Request {
  user?: IUserToken;
}

export default (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers?.authorization;
  console.log("Auth Header:", authorization); // Debugging 1

  if (!authorization) {
    return res
      .status(403)
      .json({ message: "No Authorization Header", data: null });
  }

  const [prefix, token] = authorization.split(" ");
  console.log("Prefix:", prefix, "Token:", token); // Debugging 2

  if (!(prefix === "Bearer" && token)) {
    return res
      .status(403)
      .json({ message: "Invalid Token Format", data: null });
  }

  const user = getUserData(token);
  console.log("Decoded User:", user); // Debugging 3

  if (!user) {
    return res
      .status(403)
      .json({ message: "Invalid or Expired Token", data: null });
  }

  (req as IReqUser).user = user;
  next();
};
