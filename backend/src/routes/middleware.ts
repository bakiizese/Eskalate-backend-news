import { Request, Response, NextFunction } from "express";
import { jwt_verify } from "../utils/jwt.js";

interface AuthUser {
  sub: string | null;
  role: "author" | "reader";
}

interface AuthRequest extends Request {
  user?: AuthUser;
}

export const author_auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const header = req.headers.authorization;
    const token = header?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        Success: false,
        Message: "token missing",
        Object: null,
        Errors: [{ message: "authorization token is required" }],
      });
    }

    const decode = jwt_verify(token) as AuthUser | false;

    if (!decode) {
      return res.status(401).json({
        Success: false,
        Message: "unauthorized, invalid token",
        Object: null,
        Errors: [{ message: "unauthorized, invalid token" }],
      });
    }

    if (decode.role !== "author") {
      return res.status(403).json({
        Success: false,
        Message: "forbidden",
        Object: null,
        Errors: [{ message: "user is not authorized as author" }],
      });
    }

    req.user = decode;
    next();
  } catch (error: any) {
    return res.status(401).json({
      Success: false,
      Message: "unauthorized",
      Object: null,
      Errors: [{ message: error.message }],
    });
  }
};

export const reader_auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const header = req.headers.authorization;
    if (!header) {
      req.user = { sub: null, role: "reader" };
      return next();
    }

    const token = header?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        Success: false,
        Message: "token missing",
        Object: null,
        Errors: [{ message: "authorization token is required" }],
      });
    }

    const decode = jwt_verify(token) as AuthUser | false;

    if (!decode) {
      return res.status(401).json({
        Success: false,
        Message: "unauthorized, invalid token",
        Object: null,
        Errors: [{ message: "unauthorized, invalid token" }],
      });
    }

    if (decode.role !== "reader") {
      return res.status(403).json({
        Success: false,
        Message: "forbidden",
        Object: null,
        Errors: [{ message: "user is not authorized as reader" }],
      });
    }

    req.user = decode;
    next();
  } catch (error: any) {
    return res.status(401).json({
      Success: false,
      Message: "unauthorized",
      Object: null,
      Errors: [{ message: error.message }],
    });
  }
};
