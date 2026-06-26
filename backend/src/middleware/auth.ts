import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import ApiError from "../utils/ApiError.js";

// Guards every protected route. Expects: Authorization: Bearer <accessToken>
export default function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new ApiError(401, "Missing or malformed Authorization header"));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, name: payload.name };
    next();
  } catch (err) {
    const message =
      err instanceof Error && err.name === "TokenExpiredError"
        ? "Access token expired"
        : "Invalid access token";
    next(new ApiError(401, message));
  }
}
