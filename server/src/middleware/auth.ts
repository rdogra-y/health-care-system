import type {
  NextFunction,
  Request,
  Response
} from "express";

import {
  verifyAccessToken,
  type AuthTokenPayload
} from "../utils/jwt";

export type AuthenticatedRequest = Request & {
  user?: AuthTokenPayload;
};

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authorization = req.headers.authorization;

  if (
    !authorization ||
    !authorization.startsWith("Bearer ")
  ) {
    res.status(401).json({
      success: false,
      message: "Authentication required"
    });

    return;
  }

  const token = authorization.substring(7);

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired session"
    });
  }
}

export function authorize(
  ...roles: AuthTokenPayload["role"][]
) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required"
      });

      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action"
      });

      return;
    }

    next();
  };
}