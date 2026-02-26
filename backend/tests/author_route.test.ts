import request from "supertest";
import app from "../src/app";
import Article from "../src/models/Article";
import * as jwtUtils from "../src/utils/jwt";

let token: string = "";
let articleId: string = "";

beforeAll(async () => {
  await request(app).post("/auth/register").send({
    email: "testauthor@test.com",
    name: "testauthor",
    role: "author",
    password: "Password@1",
  });

  const res = await request(app).post("/auth/login").send({
    email: "testauthor@test.com",
    password: "Password@1",
  });

  token = res.body.Object.token;
});

describe("author middleware test", () => {
  it("should return token missing 401 if token not provided", async () => {
    const res = await request(app).post("/author/articles").send({
      title: "testarticle",
      content: "testcontenttestcontenttestcontenttestcontenttestcontent",
      category: "testcategory",
      status: "Published",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.Success).toBe(false);
    expect(res.body.Message).toBe("token missing");
  });

  it("should return unauthorized, invalid token 401 if token is incorrect", async () => {
    const spy = jest
      .spyOn(jwtUtils, "jwt_verify")
      .mockImplementation(() => false as any);
    const res = await request(app)
      .post("/author/articles")
      .send({
        title: "testarticle",
        content: "testcontenttestcontenttestcontenttestcontenttestcontent",
        category: "testcategory",
        status: "Published",
      })
      .set("Authorization", `Bearer token`);

    expect(res.statusCode).toBe(401);
    expect(res.body.Success).toBe(false);
    expect(res.body.Message).toBe("unauthorized, invalid token");

    spy.mockRestore();
  });

  it("should return forbidden 403 if user is not author", async () => {
    const spy = jest.spyOn(jwtUtils, "jwt_verify").mockImplementation(() => ({
      sub: "userid",
      role: "reader",
    }));
    const res = await request(app)
      .post("/author/articles")
      .send({
        title: "testarticle",
        content: "testcontenttestcontenttestcontenttestcontenttestcontent",
        category: "testcategory",
        status: "Published",
      })
      .set("Authorization", `Bearer token`);

    expect(res.statusCode).toBe(403);
    expect(res.body.Success).toBe(false);
    expect(res.body.Message).toBe("forbidden");

    spy.mockRestore();
  });

  it("should return unauthorized 401 if unexpected error occured", async () => {
    const spy = jest.spyOn(jwtUtils, "jwt_verify").mockImplementation(() => {
      throw new Error("jwt failed");
    });
    const res = await request(app)
      .post("/author/articles")
      .send({
        title: "testarticle",
        content: "testcontenttestcontenttestcontenttestcontenttestcontent",
        category: "testcategory",
        status: "Published",
      })
      .set("Authorization", `Bearer token`);

    expect(res.statusCode).toBe(401);
    expect(res.body.Success).toBe(false);
    expect(res.body.Message).toBe("unauthorized");

    spy.mockRestore();
  });
});

describe("POST /author/articles", () => {
  it("should return 201 if article created successfully", async () => {
    const res = await request(app)
      .post("/author/articles")
      .send({
        title: "testarticle",
        content: "testcontenttestcontenttestcontenttestcontenttestcontent",
        category: "testcategory",
        status: "Published",
      })
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(201);
    expect(res.body.Success).toBe(true);
    expect(res.body.Object).toMatchObject({
      title: "testarticle",
      content: "testcontenttestcontenttestcontenttestcontenttestcontent",
      category: "testcategory",
      status: "Published",
    });

    articleId = res.body.Object.id;
  });

  it("should return 400 if validation error", async () => {
    const res = await request(app)
      .post("/author/articles")
      .send({
        content: "testcontenttestcontenttestcontenttestcontenttestcontent",
        category: "testcategory",
      })
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.Success).toBe(false);
    expect(res.body.Message).toBe("validation failed");
  });

  it("should return 500 if internal error occured", async () => {
    const actualArticle = Article.create;
    (Article as any).create = jest.fn().mockImplementation(() => {
      throw new Error("db failure");
    });

    const res = await request(app)
      .post("/author/articles")
      .send({
        title: "testarticle",
        content: "testcontenttestcontenttestcontenttestcontenttestcontent",
        category: "testcategory",
        status: "Published",
      })
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.Success).toBe(false);
    expect(res.body.Message).toBe("internal server error");

    (Article as any).create = actualArticle;
  });
});

describe("GET /author/articles/me", () => {
  it("should return articles created by this author", async () => {
    const res = await request(app)
      .get("/author/articles/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.Success).toBe(true);
    expect(res.body.Message).toBe("articles fetched successfully");
    expect(res.body.Object).toMatchObject([
      {
        title: "testarticle",
        content: "testcontenttestcontenttestcontenttestcontenttestcontent",
        category: "testcategory",
        status: "Published",
      },
    ]);
  });

  it("should return 500 if internal error occured", async () => {
    const actualArticle = Article.findAndCountAll;
    (Article as any).findAndCountAll = jest.fn().mockImplementation(() => {
      throw new Error("db failure");
    });

    const res = await request(app)
      .get("/author/articles/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.Success).toBe(false);
    expect(res.body.Message).toBe("internal server error");

    (Article as any).findAndCountAll = actualArticle;
  });
});

describe("PUT /author/articles/:id", () => {
  it("should return 400 if validation error", async () => {
    const res = await request(app)
      .put(`/author/articles/${articleId}`)
      .send({ title: "" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.Success).toBe(false);
    expect(res.body.Message).toBe("validation failed");
  });

  it("should return 404 if article not updated or not found", async () => {
    const spy = jest.spyOn(Article, "update").mockResolvedValue([0]);
    const res = await request(app)
      .put(`/author/articles/${articleId}`)
      .send({
        content: "updatedtestariclesupdatedtestariclesupdatedtestaricleswwww",
      })
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.Success).toBe(false);
    expect(res.body.Message).toBe("article not found");

    spy.mockRestore();
  });

  it("should return 500 if internal error occured", async () => {
    const spy = jest.spyOn(Article, "update").mockImplementation(() => {
      throw new Error("db failed");
    });
    const res = await request(app)
      .put(`/author/articles/${articleId}`)
      .send({
        content: "updatedtestariclesupdatedtestariclesupdatedtestaricleswwww",
      })
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.Success).toBe(false);
    expect(res.body.Message).toBe("internal server error");

    spy.mockRestore();
  });

  it("should return 200 if article updated successfully", async () => {
    const res = await request(app)
      .put(`/author/articles/${articleId}`)
      .send({
        content: "updatedtestariclesupdatedtestariclesupdatedtestaricles",
      })
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.Success).toBe(true);
    expect(res.body.Message).toBe("article updated successfully");
    expect(res.body.Object).toMatchObject({
      title: "testarticle",
      content: "updatedtestariclesupdatedtestariclesupdatedtestaricles",
      category: "testcategory",
    });
  });
});

describe("DELETE /author/articles/:id", () => {
  it("should return 404 if article not deleted or not found", async () => {
    const spy = jest.spyOn(Article, "update").mockResolvedValue([0]);
    const res = await request(app)
      .delete(`/author/articles/${articleId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.Success).toBe(false);
    expect(res.body.Message).toBe("article not found");

    spy.mockRestore();
  });

  it("should return 500 if internal error occured", async () => {
    const spy = jest.spyOn(Article, "update").mockImplementation(() => {
      throw new Error("db failed");
    });
    const res = await request(app)
      .delete(`/author/articles/${articleId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.Success).toBe(false);
    expect(res.body.Message).toBe("internal server error");

    spy.mockRestore();
  });

  it("should return 200 if article deleted successfully", async () => {
    const res = await request(app)
      .delete(`/author/articles/${articleId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.Success).toBe(true);
    expect(res.body.Message).toBe("article deleted successfully");
  });

  it("should return 404 if article is soft deleted", async () => {
    const res = await request(app)
      .put(`/author/articles/${articleId}`)
      .send({
        content: "updatedtestariclesupdatedtestariclesupdatedtestaricleswwww",
      })
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.Success).toBe(false);
    expect(res.body.Message).toBe("article not found");
  });
});

describe("GET /author/articles/dashboard", () => {
  it("should return daily analytics of each article written by this author", async () => {
    const res = await request(app)
      .get("/author/articles/dashboard")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.Success).toBe(true);
    expect(res.body.TotalSize).toBe(0);
    expect(res.body.Object).toMatchObject([]);
  });

  it("should return 500 if internal error occured", async () => {
    const spy = jest.spyOn(Article, "findAll").mockImplementation(() => {
      throw new Error("db failed");
    });
    const res = await request(app)
      .get("/author/articles/dashboard")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.Success).toBe(false);
    expect(res.body.Message).toBe("internal server error");

    spy.mockRestore();
  });
});
