import express, { Request, Response, Router } from "express";
import Article from "../models/Article.js";
import User from "../models/User.js";
import ReadLog from "../models/ReadLog.js";
import { Op } from "sequelize";
import { reader_auth } from "./middleware.js";

interface AuthRequest extends Request {
  user?: {
    sub: string | null;
    role: string;
  };
}

interface ReaderQuery {
  category?: string;
  author?: string;
  q?: string;
  page?: string;
  limit?: string;
}

const readerRouter: Router = express.Router();

readerRouter.get(
  "/articles",
  reader_auth,
  async (req: AuthRequest & { query: ReaderQuery }, res: Response) => {
    try {
      const { category, author, q } = req.query;
      const page = Math.max(parseInt(req.query.page || "1"), 1);
      const limit = Math.min(
        Math.max(parseInt(req.query.limit || "10"), 1),
        100,
      );
      const offset = (page - 1) * limit;

      const whereCon: any = {
        deletedAt: null,
        status: "Published",
      };

      if (category) {
        whereCon.category = category;
      }

      if (q) {
        whereCon.title = {
          [Op.iLike]: `%${q}%`,
        };
      }

      const { count, rows } = await Article.findAndCountAll({
        where: whereCon,
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "name"],
            where: author
              ? {
                  name: {
                    [Op.iLike]: `%${author}%`,
                  },
                }
              : undefined,
          },
        ],
        limit,
        offset,
        order: [["createdAt", "DESC"]],
        attributes: [
          "id",
          "title",
          "content",
          "category",
          "status",
          "createdAt",
          "updatedAt",
        ],
      });

      return res.status(200).json({
        Success: true,
        Message: "articles fetched successfully",
        Object: rows,
        PageNumber: page,
        PageSize: limit,
        TotalSize: count,
        Errors: null,
      });
    } catch (error: any) {
      return res.status(500).json({
        Success: false,
        Message: "internal server error",
        Object: null,
        Errors: [{ message: (error as Error).message }],
      });
    }
  },
);

readerRouter.get(
  "/articles/:id",
  reader_auth,
  async (req: AuthRequest, res: Response) => {
    try {
      const articleIdParam = req.params.id;
      const articleId = Array.isArray(articleIdParam)
        ? articleIdParam[0]
        : articleIdParam;

      const readerId = req.user?.sub || null;

      const article = await Article.findOne({
        where: { id: articleId, deletedAt: null },
      });

      if (!article) {
        return res.status(404).json({
          Success: false,
          Message: "news article no longer available",
          Object: null,
          Errors: [{ message: "News article no longer available" }],
        });
      }

      await ReadLog.create({
        articleId,
        readerId,
        readAt: new Date(),
      });

      return res.status(200).json({
        Success: true,
        Message: "news article available",
        Object: {
          ...article.dataValues,
          deletedAt: undefined,
          authorId: undefined,
        },
        Errors: null,
      });
    } catch (error: any) {
      return res.status(500).json({
        Success: false,
        Message: "internal server error",
        Object: null,
        Errors: [{ message: (error as Error).message }],
      });
    }
  },
);

export default readerRouter;
