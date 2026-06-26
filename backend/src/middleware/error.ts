import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import ApiError from "../utils/ApiError.js";

interface PrismaLikeError {
  code?: string;
  meta?: { target?: string };
}

// 404 for unmatched routes
export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// Centralized error handler -> consistent error envelope
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const apiErr = err as ApiError & PrismaLikeError;
  let statusCode = apiErr.statusCode || 500;
  let message = apiErr.message || "Internal Server Error";
  const details = apiErr.details;

  if (apiErr.code === "P2002") {
    statusCode = 409;
    message = `Unique constraint failed on: ${apiErr.meta?.target}`;
  }
  if (apiErr.code === "P2025") {
    statusCode = 404;
    message = "Record not found";
  }

  if (statusCode === 500 && process.env.NODE_ENV !== "test") {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(statusCode).json({ error: { message, details } });
};
