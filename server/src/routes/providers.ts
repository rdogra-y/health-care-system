import { Router } from "express";
import { db } from "../prisma/db";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const providers = await db.orm.public.Provider.all();

    res.status(200).json({
      success: true,
      data: providers
    });
  } catch (error) {
    console.error("Providers error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load providers"
    });
  }
});

export default router;