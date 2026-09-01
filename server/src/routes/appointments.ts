import { Router } from "express";
import { db } from "../prisma/db";
import {
  authenticate,
  authorize
} from "../middleware/auth";

const router = Router();

const allowedStatuses = [
  "SCHEDULED",
  "CHECKED_IN",
  "WAITING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED"
] as const;

router.get(
  "/",
  authenticate,
  authorize(
    "ADMIN",
    "DOCTOR",
    "RECEPTIONIST"
  ),
  async (_req, res) => {
    try {
      const appointments =
        await db.orm.public.Appointment.all();

      res.status(200).json({
        success: true,
        data: appointments
      });
    } catch (error) {
      console.error(
        "Appointments error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to load appointments"
      });
    }
  }
);

router.post(
  "/",
  authenticate,
  authorize(
    "ADMIN",
    "RECEPTIONIST"
  ),
  async (req, res) => {
    try {
      const {
        patientId,
        providerId,
        scheduledAt,
        reason
      } = req.body;

      const parsedPatientId =
        Number(patientId);

      const parsedProviderId =
        Number(providerId);

      if (
        !Number.isInteger(
          parsedPatientId
        ) ||
        parsedPatientId <= 0
      ) {
        res.status(400).json({
          success: false,
          message:
            "Select a valid patient"
        });

        return;
      }

      if (
        !Number.isInteger(
          parsedProviderId
        ) ||
        parsedProviderId <= 0
      ) {
        res.status(400).json({
          success: false,
          message:
            "Select a valid provider"
        });

        return;
      }

      if (!scheduledAt) {
        res.status(400).json({
          success: false,
          message:
            "Appointment date and time are required"
        });

        return;
      }

      const scheduledDate =
        new Date(scheduledAt);

      if (
        Number.isNaN(
          scheduledDate.getTime()
        )
      ) {
        res.status(400).json({
          success: false,
          message:
            "Enter a valid appointment date and time"
        });

        return;
      }

      if (
        scheduledDate <= new Date()
      ) {
        res.status(400).json({
          success: false,
          message:
            "Appointment must be scheduled for a future date and time"
        });

        return;
      }

      const patient =
        await db.orm.public.Patient
          .where({
            id: parsedPatientId
          })
          .first();

      if (!patient) {
        res.status(404).json({
          success: false,
          message:
            "Patient not found"
        });

        return;
      }

      const provider =
        await db.orm.public.Provider
          .where({
            id: parsedProviderId
          })
          .first();

      if (!provider) {
        res.status(404).json({
          success: false,
          message:
            "Provider not found"
        });

        return;
      }

      const appointment =
        await db.orm.public.Appointment.create({
          patientId:
            parsedPatientId,

          providerId:
            parsedProviderId,

          scheduledAt:
            scheduledDate.toISOString(),

          status:
            "SCHEDULED",

          reason:
            typeof reason ===
              "string" &&
            reason.trim()
              ? reason
                  .trim()
                  .slice(0, 500)
              : null
        });

      res.status(201).json({
        success: true,
        data: appointment
      });
    } catch (error) {
      console.error(
        "Create appointment error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to schedule appointment"
      });
    }
  }
);

router.patch(
  "/:id/status",
  authenticate,
  authorize(
    "ADMIN",
    "DOCTOR",
    "RECEPTIONIST"
  ),
  async (req, res) => {
    try {
      const appointmentId =
        Number(req.params.id);

      const { status } =
        req.body;

      if (
        !Number.isInteger(
          appointmentId
        ) ||
        appointmentId <= 0
      ) {
        res.status(400).json({
          success: false,
          message:
            "Invalid appointment"
        });

        return;
      }

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        res.status(400).json({
          success: false,
          message:
            "Invalid appointment status"
        });

        return;
      }

      const appointment =
        await db.orm.public.Appointment
          .where({
            id: appointmentId
          })
          .first();

      if (!appointment) {
        res.status(404).json({
          success: false,
          message:
            "Appointment not found"
        });

        return;
      }

      const timestamp =
        new Date().toISOString();

      const timestamps: {
        checkedInAt?: string;
        startedAt?: string;
        completedAt?: string;
      } = {};

      if (
        status ===
        "CHECKED_IN"
      ) {
        timestamps.checkedInAt =
          timestamp;
      }

      if (
        status === "WAITING" &&
        !appointment.checkedInAt
      ) {
        timestamps.checkedInAt =
          timestamp;
      }

      if (
        status ===
        "IN_PROGRESS"
      ) {
        timestamps.startedAt =
          timestamp;
      }

      if (
        status ===
        "COMPLETED"
      ) {
        timestamps.completedAt =
          timestamp;
      }

      const updatedAppointment =
        await db.orm.public.Appointment
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
      console.error(
        "Update appointment status error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to update appointment status"
      });
    }
  }
);

export default router;