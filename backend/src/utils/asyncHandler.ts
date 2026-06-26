import type { Request, Response, NextFunction, RequestHandler } from "express";

// Wraps an async route handler so thrown errors flow to the error middleware.
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
