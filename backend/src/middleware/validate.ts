import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { ZodSchema } from "zod";
import ApiError from "../utils/ApiError.js";

type Source = "body" | "query" | "params";

// Validates a request part against a zod schema, replacing it with parsed data.
const validate =
  (schema: ZodSchema, source: Source = "body"): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      return next(new ApiError(400, "Validation failed", details));
    }
    // req.query/params are read-only getters in some setups; assign defensively.
    (req as Record<Source, unknown>)[source] = result.data;
    next();
  };

export default validate;
