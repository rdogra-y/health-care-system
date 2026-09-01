import { Router } from "express";
import { db } from "../prisma/db";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const patients = await db.orm.public.Patient.all();

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
});

router.post("/", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      address
    } = req.body;

    if (!firstName || !lastName || !dateOfBirth) {
      res.status(400).json({
        success: false,
        message: "First name, last name and date of birth are required"
      });

      return;
    }

    const patient = await db.orm.public.Patient.create({
      firstName,
      lastName,
      email: email || null,
      phone: phone || null,
      dateOfBirth,
      gender: gender || null,
      address: address || null
    });

    res.status(201).json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error("Create patient error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create patient"
    });
  }
});

export default router;