import request from "supertest";
import app from "../src/app";
import User from "../src/models/User";

describe("POST /auth/register", () => {
  it("should return 201 if registration successful", async () => {
    const res = await request(app).post("/auth/register").send({
      email: "testauthor@test.com",
      name: "testauthor",
      role: "author",
      password: "Password@1",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.Success).toBe(true);
    expect(res.body.Message).toBe("user created successfully");
    expect(res.body.Object).toMatchObject({
      email: "testauthor@test.com",
      name: "testauthor",
      role: "author",
    });
  });

  it("should return 400 if validation error", async () => {
    const res = await request(app).post("/auth/register").send({
      name: "testauthor",
      role: "author",
      password: "Password@1",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.Success).toBe(false);
    expect(res.body.Message).toBe("validation failed");
  });

  it("should return 409 if email already exists", async () => {
    const res = await request(app).post("/auth/register").send({
      email: "testauthor@test.com",
      name: "testauthor",
      role: "author",
      password: "Password@1",
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.Success).toBe(false);
    expect(res.body.Message).toBe("email already exists");
  });

  it("should return 500 if internal error occurred", async () => {
    const originalFindOne = User.findOne;
    User.findOne = jest.fn().mockImplementation(() => {
      throw new Error("db failure");
    });

    const res = await request(app).post("/auth/register").send({
      email: "testauthor@test.com",
      name: "testauthor",
      role: "author",
      password: "Password@1",
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.Success).toBe(false);
    expect(res.body.Message).toBe("internal server error");

    User.findOne = originalFindOne;
  });
});

describe("POST /auth/login", () => {
  it("should return user if email exists", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "testauthor@test.com",
      password: "Password@1",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.Success).toBe(true);
    expect(res.body.Object.user).toMatchObject({
      email: "testauthor@test.com",
      name: "testauthor",
      role: "author",
    });
  });

  it("should return 404 if email not found", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "notfound@test.com",
      password: "Password@1",
    });

    expect(res.statusCode).toBe(404);
    expect(res.body.Success).toBe(false);
    expect(res.body.Message).toBe("user not found");
  });

  it("should return 400 if password is incorrect", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "testauthor@test.com",
      password: "wrong",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.Success).toBe(false);
    expect(res.body.Message).toBe("incorrect password");
  });

  it("should return 400 if validation error", async () => {
    const res = await request(app).post("/auth/login").send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.Success).toBe(false);
    expect(res.body.Message).toBe("validation failed");
  });

  it("should return 500 if internal error occurs", async () => {
    const originalFindOne = User.findOne;
    User.findOne = jest.fn().mockImplementation(() => {
      throw new Error("db failure");
    });

    const res = await request(app).post("/auth/login").send({
      email: "testauthor@test.com",
      password: "Password@1",
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.Success).toBe(false);
    expect(res.body.Message).toBe("internal server error");

    User.findOne = originalFindOne;
  });
});
