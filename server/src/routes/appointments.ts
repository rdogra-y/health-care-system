import { Router } from "express";
import { db } from "../prisma/db";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const appointments = await db.orm.public.Appointment.all();

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error("Appointments error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load appointments"
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      patientId,
      providerId,
      scheduledAt,
      reason
    } = req.body;

    if (!patientId || !providerId || !scheduledAt) {
      res.status(400).json({
        success: false,
        message: "Patient, provider and appointment time are required"
      });

      return;
    }

    const appointment = await db.orm.public.Appointment.create({
      patientId: Number(patientId),
      providerId: Number(providerId),
      scheduledAt,
      status: "SCHEDULED",
      reason: reason || null
    });

    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error("Create appointment error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create appointment"
    });
  }
});

export default router;