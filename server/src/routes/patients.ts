import { Router } from "express";
import { db } from "../prisma/db";
import {
  authenticate,
  authorize
} from "../middleware/auth";
import { patientSchema } from "../validation/patient";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "DOCTOR", "RECEPTIONIST"),
  async (_req, res) => {
    try {
      const patients =
        await db.orm.public.Patient.all();

      res.status(200).json({
        success: true,
        data: patients
      });
    } catch (error) {
      console.error("Patients error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to load patients"
      });
    }
  }
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "RECEPTIONIST"),
  async (req, res) => {
    try {
      const validation =
        patientSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Invalid patient information",
          errors:
            validation.error.flatten().fieldErrors
        });

        return;
      }

      const data = validation.data;

      const patient =
        await db.orm.public.Patient.create({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email || null,
          phone: data.phone || null,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender || null,
          address: data.address || null
        });

      res.status(201).json({
        success: true,
        data: patient
      });
    } catch (error) {
      console.error(
        "Create patient error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Unable to create patient"
      });
    }
  }
);

export default router;