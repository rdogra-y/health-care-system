import { Router } from "express";
import { db } from "../prisma/db";
import {
  authenticate,
  authorize
} from "../middleware/auth";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  async (_req, res) => {
  try {
    const [
      patients,
      providers,
      appointments,
      waitingAppointments,
      completedAppointments
    ] = await Promise.all([
      db.orm.public.Patient.all(),

      db.orm.public.Provider.all(),

      db.orm.public.Appointment.all(),

      db.orm.public.Appointment
        .where({
          status: "WAITING"
        })
        .all(),

      db.orm.public.Appointment
        .where({
          status: "COMPLETED"
        })
        .all()
    ]);

    const waitingTimes = waitingAppointments
      .filter((appointment) => appointment.checkedInAt)
      .map((appointment) => {
        const checkedInTime = new Date(
          appointment.checkedInAt as string
        ).getTime();

        const currentTime = Date.now();

        return Math.max(
          0,
          Math.round(
            (currentTime - checkedInTime) / (1000 * 60)
          )
        );
      });

    const averageWaitTime =
      waitingTimes.length > 0
        ? Math.round(
            waitingTimes.reduce(
              (total, time) => total + time,
              0
            ) / waitingTimes.length
          )
        : 0;

    res.status(200).json({
      success: true,

      data: {
        totalPatients: patients.length,
        totalProviders: providers.length,
        totalAppointments: appointments.length,
        waitingPatients: waitingAppointments.length,
        completedAppointments: completedAppointments.length,
        averageWaitTime
      }
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load dashboard data"
    });
  }
});

export default router;