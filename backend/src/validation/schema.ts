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

export const articleSchema: ObjectSchema = Joi.object({
  title: Joi.string().required().min(1).max(150).messages({
    "string.base": "title must be a string",
    "string.empty": "title is required",
    "string.min": "title must be at least 1 character",
    "string.max": "title cannot exceed 150 characters",
    "any.required": "title is required",
  }),
  content: Joi.string().min(50).required().messages({
    "string.base": "content must be a string",
    "string.empty": "content is required",
    "string.min": "content must be at least 50 characters",
    "any.required": "content is required",
  }),
  category: Joi.string().required().messages({
    "string.base": "category must be a string",
    "string.empty": "category is required",
    "any.required": "category is required",
  }),
  status: Joi.string().valid("Draft", "Published").default("Draft").messages({
    "string.base": "status must be a string",
    "any.only": "status must be Draft or Published",
  }),
});

export const articleSchemaPut: ObjectSchema = Joi.object({
  title: Joi.string().min(1).max(150).messages({
    "string.base": "title must be a string",
    "string.empty": "title is required",
    "string.min": "title must be at least 1 character",
    "string.max": "title cannot exceed 150 characters",
  }),
  content: Joi.string().min(50).messages({
    "string.base": "content must be a string",
    "string.empty": "content is required",
    "string.min": "content must be at least 50 characters",
  }),
  category: Joi.string().messages({
    "string.base": "category must be a string",
    "string.empty": "category is required",
  }),
  status: Joi.string().valid("Draft", "Published").default("Draft").messages({
    "string.base": "status must be a string",
    "any.only": "status must be Draft or Published",
  }),
});
