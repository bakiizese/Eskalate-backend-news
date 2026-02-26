import Joi, { ObjectSchema } from "joi";

export const registerSchema: ObjectSchema = Joi.object({
  name: Joi.string()
    .pattern(/^[A-Za-z ]+$/)
    .required()
    .messages({
      "string.pattern.base": "name must only contain letters and spaces",
      "string.empty": "name is required",
    }),
  email: Joi.string()
    .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .required()
    .messages({
      "string.pattern.base": "invalid email format",
      "string.empty": "email is required",
    }),
  password: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*?])[A-Za-z\d!@#$%^&*?]{8,}$/,
    )
    .required()
    .messages({
      "string.pattern.base":
        "password must be at least 8 chars, include uppercase, lowercase, number, and special character",
      "string.empty": "password is required",
    }),
  role: Joi.string().valid("author", "reader").required().messages({
    "any.only": "role must be 'author' or 'reader'",
    "string.empty": "role is required",
  }),
});

export const loginSchema: ObjectSchema = Joi.object({
  email: Joi.string()
    .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .required()
    .messages({
      "string.pattern.base": "invalid email format",
      "string.empty": "email is required",
    }),
  password: Joi.string().required().messages({
    "string.empty": "password is required",
  }),
});
