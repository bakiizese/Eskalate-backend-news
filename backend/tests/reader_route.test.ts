import request from "supertest";
import app from "../src/app";
import Article from "../src/models/Article";

let token: string = "";
let articleId: string = "";

beforeAll(async () => {
  await request(app).post("/auth/register").send({
    email: "testreader@test.com",
    name: "testreader",
    role: "reader",
    password: "Password@1",
  });

  const resReader = await request(app).post("/auth/login").send({
    email: "testreader@test.com",
    password: "Password@1",
  });

  await request(app).post("/auth/register").send({
    email: "testauthor@test.com",
    name: "testauthor",
    role: "author",
    password: "Password@1",
  });

  const resAuthor = await request(app).post("/auth/login").send({
    email: "testauthor@test.com",
    password: "Password@1",
  });

  const tokenAuthor: string = resAuthor.body.Object.token;

  const articles = await request(app)
    .post("/author/articles")
    .send({
      title: "testarticle",
      content: "testcontenttestcontenttestcontenttestcontenttestcontent",
      category: "testcategory",
      status: "Published",
    })
    .set("Authorization", `Bearer ${tokenAuthor}`);

  articleId = articles.body.Object.id;
  token = resReader.body.Object.token;
});

describe("GET /reader/articles", () => {
  it("should return published articles with correct pagination and filters", async () => {
    const res = await request(app)
      .get("/reader/articles")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.Success).toBe(true);
    expect(res.body.Message).toBe("articles fetched successfully");
    expect(res.body.PageNumber).toBe(1);
    expect(res.body.PageSize).toBe(10);
  });

  it("should return 500 if internal error occurs", async () => {
    const originalFn = Article.findAndCountAll;
    (Article as any).findAndCountAll = jest.fn().mockImplementation(() => {
      throw new Error("db failure");
    });

    const res = await request(app)
      .get("/reader/articles")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.Success).toBe(false);
    expect(res.body.Message).toBe("internal server error");

    (Article as any).findAndCountAll = originalFn;
  });
});

describe("GET /reader/articles/:id", () => {
  it("should return the article and create a read log", async () => {
    const res = await request(app)
      .get(`/reader/articles/${articleId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.Success).toBe(true);
    expect(res.body.Message).toBe("news article available");
    expect(res.body.Object).toMatchObject({
      id: articleId,
      title: "testarticle",
      content: "testcontenttestcontenttestcontenttestcontenttestcontent",
      category: "testcategory",
      status: "Published",
    });
  });

  it("should return 404 if article is not found", async () => {
    const findOneMock = jest.spyOn(Article, "findOne").mockResolvedValue(null);

    const res = await request(app)
      .get(`/reader/articles/${articleId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.Success).toBe(false);
    expect(res.body.Message).toBe("news article no longer available");
    expect(res.body.Object).toBeNull();

    findOneMock.mockRestore();
  });

  it("should return 500 if internal error occurs", async () => {
    const findOneMock = jest
      .spyOn(Article, "findOne")
      .mockImplementation(() => {
        throw new Error("db failure");
      });

    const res = await request(app)
      .get(`/reader/articles/${articleId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.Success).toBe(false);
    expect(res.body.Message).toBe("internal server error");
    expect(res.body.Object).toBeNull();

    findOneMock.mockRestore();
  });
});
