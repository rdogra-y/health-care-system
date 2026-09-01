import "dotenv/config";
import bcrypt from "bcryptjs";

import { db } from "./prisma/db";

async function createAdmin() {
  const email = "admin@healthcare.local";
  const password = "HealthCareDemo2026!";

  const existingUser = await db.orm.public.User
    .where({
      email
    })
    .first();

  if (existingUser) {
    console.log("Demo administrator already exists");
    return;
  }

  const passwordHash = await bcrypt.hash(
    password,
    12
  );

  await db.orm.public.User.create({
    email,
    passwordHash,
    firstName: "System",
    lastName: "Administrator",
    role: "ADMIN"
  });

  console.log("Demo administrator created");
}

createAdmin()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(
      "Unable to create demo administrator:",
      error
    );

    process.exit(1);
  });