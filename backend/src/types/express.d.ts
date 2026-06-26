// Augment Express Request with the authenticated user set by auth middleware.
import "express";

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      email: string;
      name: string;
    }
    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
