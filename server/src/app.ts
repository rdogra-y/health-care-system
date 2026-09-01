import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dashboardRouter from "./routes/dashboard";
import patientsRouter from "./routes/patients";
import providersRouter from "./routes/providers";
import appointmentsRouter from "./routes/appointments";
import authRouter from "./routes/auth";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Health Care System API is running",
    status: "success"
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "health-care-system-api"
  });
});

app.use("/api/auth", authRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/patients", patientsRouter);
app.use("/api/providers", providersRouter);
app.use("/api/appointments", appointmentsRouter);

app.listen(PORT, () => {
  console.log(`Health Care System API running on port ${PORT}`);
});