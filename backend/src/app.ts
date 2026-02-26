import express, { Application, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

import Association from "./models/Association.js";
import authRouter from "./routes/auth_route.js";
import authorRouter from "./routes/author_route.js";
import readerRouter from "./routes/reader_route.js";

dotenv.config();

const app: Application = express();

app.use(express.json());

Association();

app.use("/auth", authRouter);
app.use("/author", authorRouter);
app.use("/reader", readerRouter);

app.use(
  (err: any, req: Request, res: Response, next: NextFunction): Response => {
    return res.status(err.status || 500).json({
      error: {
        code: err.status || 500,
        message: err.message || "Internal Server Error",
      },
    });
  },
);

export default app;
