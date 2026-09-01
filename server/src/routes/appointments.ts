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

router.patch("/:id/status", async (req, res) => {
  try {
    const appointmentId = Number(req.params.id);
    const { status } = req.body;

    const allowedStatuses = [
      "SCHEDULED",
      "CHECKED_IN",
      "WAITING",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED"
    ];

    if (!appointmentId || !allowedStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: "Invalid appointment or status"
      });

      return;
    }

    const timestamp = new Date().toISOString();

    const appointment = await db.orm.public.Appointment
      .where({
        id: appointmentId
      })
      .first();

    if (!appointment) {
      res.status(404).json({
        success: false,
        message: "Appointment not found"
      });

      return;
    }

    const timestamps: {
      checkedInAt?: string;
      startedAt?: string;
      completedAt?: string;
    } = {};

    if (status === "CHECKED_IN") {
      timestamps.checkedInAt = timestamp;
    }

    if (status === "WAITING" && !appointment.checkedInAt) {
      timestamps.checkedInAt = timestamp;
    }

    if (status === "IN_PROGRESS") {
      timestamps.startedAt = timestamp;
    }

    if (status === "COMPLETED") {
      timestamps.completedAt = timestamp;
    }

    const updatedAppointment = await db.orm.public.Appointment
      .where({
        id: appointmentId
      })
      .update({
        status,
        ...timestamps
      });

    res.status(200).json({
      success: true,
      data: updatedAppointment
    });
  } catch (error) {
    console.error("Update appointment status error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update appointment status"
    });
  }
});

export default router;