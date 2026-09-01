import { Router } from "express";
import bcrypt from "bcryptjs";

import { db } from "../prisma/db";
import { createAccessToken } from "../utils/jwt";
import {
  authenticate,
  type AuthenticatedRequest
} from "../middleware/auth";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      res.status(400).json({
        success: false,
        message: "Email and password are required"
      });

      return;
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const user = await db.orm.public.User
      .where({
        email: normalizedEmail
      })
      .first();

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });

      return;
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });

      return;
    }

    const token = createAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to sign in"
    });
  }
});

router.get(
  "/me",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required"
        });

        return;
      }

      const user = await db.orm.public.User
        .where({
          id: req.user.userId
        })
        .first();

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found"
        });

        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Current user error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to load user"
      });
    }
  }
);

export default router;