import express, { Request, Response, Router } from "express";
import { author_auth } from "./middleware.js";
import { articleSchema, articleSchemaPut } from "../validation/schema.js";
import Article from "../models/Article.js";
import DailyAnalytics from "../models/DailyAnalytics.js";
import { ValidationError } from "joi";

interface AuthRequest extends Request {
  user?: {
    sub: string;
    role: string;
  };
}

interface PaginationQuery {
  page?: string;
  limit?: string;
  showDeleted?: string;
}

const authorRouter: Router = express.Router();

authorRouter.post(
  "/articles",
  author_auth,
  async (req: AuthRequest, res: Response) => {
    try {
      const articleData = await articleSchema.validateAsync(req.body);
      articleData.authorId = req.user!.sub;

      const article = await Article.create({ ...articleData });

      return res.status(201).json({
        Success: true,
        Message: "article created successfully",
        Object: {
          ...article.dataValues,
          deletedAt: undefined,
          authorId: undefined,
        },
        Errors: null,
      });
    } catch (error: any) {
      if ((error as ValidationError).isJoi) {
        const joiError = error as ValidationError;
        return res.status(400).json({
          Success: false,
          Message: "validation failed",
          Object: null,
          Errors: joiError.details.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }
      return res.status(500).json({
        Success: false,
        Message: "internal server error",
        Object: null,
        Errors: [{ message: (error as Error).message }],
      });
    }
  },
);

authorRouter.get(
  "/articles/me",
  author_auth,
  async (req: AuthRequest & { query: PaginationQuery }, res: Response) => {
    try {
      const authorId = req.user!.sub;
      const page = Math.max(parseInt(req.query.page || "1"), 1);
      const limit = Math.min(
        Math.max(parseInt(req.query.limit || "10"), 1),
        100,
      );
      const offset = (page - 1) * limit;
      const whereCon: any = { authorId };
      const showDeleted = req.query.showDeleted === "true";

      if (!showDeleted) whereCon.deletedAt = null;

      const { count, rows } = await Article.findAndCountAll({
        where: whereCon,
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
          "deletedAt",
        ],
      });

      const articles = rows.map((a) => {
        const article = a.toJSON();
        const isDeleted = !!article.deletedAt;
        delete article.deletedAt;
        return { ...article, isDeleted };
      });

      return res.status(200).json({
        Success: true,
        Message: "articles fetched successfully",
        Object: articles,
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

authorRouter.put(
  "/articles/:id",
  author_auth,
  async (req: AuthRequest, res: Response) => {
    try {
      const articleId = req.params.id;
      const authorId = req.user!.sub;
      const articleData = await articleSchemaPut.validateAsync(req.body);

      const [updatedCount] = await Article.update(articleData, {
        where: { id: articleId, authorId, deletedAt: null },
      });

      if (updatedCount === 0) {
        return res.status(404).json({
          Success: false,
          Message: "article not found",
          Object: null,
          Errors: [{ message: "no article updated" }],
        });
      }

      const article = await Article.findOne({ where: { id: articleId } });

      return res.status(200).json({
        Success: true,
        Message: "article updated successfully",
        Object: {
          ...article!.dataValues,
          deletedAt: undefined,
          authorId: undefined,
        },
        Errors: null,
      });
    } catch (error: any) {
      if ((error as ValidationError).isJoi) {
        const joiError = error as ValidationError;
        return res.status(400).json({
          Success: false,
          Message: "validation failed",
          Object: null,
          Errors: joiError.details.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }
      return res.status(500).json({
        Success: false,
        Message: "internal server error",
        Object: null,
        Errors: [{ message: (error as Error).message }],
      });
    }
  },
);

authorRouter.delete(
  "/articles/:id",
  author_auth,
  async (req: AuthRequest, res: Response) => {
    try {
      const articleId = req.params.id;
      const authorId = req.user!.sub;

      const [updatedCount] = await Article.update(
        { deletedAt: new Date() },
        { where: { id: articleId, authorId, deletedAt: null } },
      );

      if (updatedCount === 0) {
        return res.status(404).json({
          Success: false,
          Message: "article not found",
          Object: null,
          Errors: [{ message: "no article deleted" }],
        });
      }

      return res.status(200).json({
        Success: true,
        Message: "article deleted successfully",
        Object: null,
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

authorRouter.get(
  "/articles/dashboard",
  author_auth,
  async (req: AuthRequest & { query: PaginationQuery }, res: Response) => {
    try {
      const page = Math.max(parseInt(req.query.page || "1"), 1);
      const limit = Math.min(
        Math.max(parseInt(req.query.limit || "10"), 1),
        100,
      );
      const offset = (page - 1) * limit;
      const authorId = req.user!.sub;

      const articles = await Article.findAll({
        where: { authorId, deletedAt: null },
        limit,
        offset,
        order: [["createdAt", "DESC"]],
        attributes: ["id", "title", "createdAt"],
        include: {
          model: DailyAnalytics,
          as: "dailyAnalytics",
          attributes: ["viewCount"],
        },
      });

      const sumArticles = articles.map((article) => {
        const dailyAnalytics = (article as any).dailyAnalytics || [];
        const totalViews = dailyAnalytics.reduce(
          (sum: number, da: { viewCount: number }) => sum + da.viewCount,
          0,
        );

        return {
          id: article.id,
          title: article.title,
          createdAt: article.createdAt,
          totalViews,
        };
      });

      return res.status(200).json({
        Success: true,
        Message: "articles fetched successfully",
        Object: sumArticles,
        PageNumber: page,
        PageSize: limit,
        TotalSize: sumArticles.length,
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

export default authorRouter;
