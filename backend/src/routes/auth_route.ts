import express, { Request, Response, Router } from "express";
import { loginSchema, registerSchema } from "../validation/schema.js";
import User from "../models/User.js";
import { hash_password, verify_password } from "../utils/password.js";
import { gen_jwt_token } from "../utils/jwt.js";
import { ValidationError } from "joi";

const authRouter: Router = express.Router();

authRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const userData = await registerSchema.validateAsync(req.body);

    const checkEmail = await User.findOne({ where: { email: userData.email } });
    if (checkEmail) {
      return res.status(409).json({
        Success: false,
        Message: "email already exists",
        Object: null,
        Errors: [
          { field: "email", message: "409 conflict email is already exists" },
        ],
      });
    }

    userData.password = await hash_password(userData.password);

    const user = await User.create({ ...userData });

    return res.status(201).json({
      Success: true,
      Message: "user created successfully",
      Object: { ...user.dataValues, password: undefined },
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
});

authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const userData = await loginSchema.validateAsync(req.body);

    const user = await User.findOne({ where: { email: userData.email } });

    if (!user) {
      return res.status(404).json({
        Success: false,
        Message: "user not found",
        Object: null,
        Errors: [{ field: "email", message: "user by email not found" }],
      });
    }

    const checkPassword = await verify_password(
      userData.password,
      user.password,
    );

    if (!checkPassword) {
      return res.status(400).json({
        Success: false,
        Message: "incorrect password",
        Object: null,
        Errors: [{ field: "password", message: "incorrect password" }],
      });
    }

    const token = gen_jwt_token({ sub: user.id, role: user.role });

    return res.status(200).json({
      Success: true,
      Message: "user login successfully",
      Object: {
        user: { ...user.dataValues, password: undefined },
        token,
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
});

export default authRouter;
