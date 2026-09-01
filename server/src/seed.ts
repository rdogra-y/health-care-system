import "dotenv/config";
import { db } from "./prisma/db";

async function main() {
  const cardiology = await db.orm.public.Department.create({
    name: "Cardiology",
    description: "Heart and cardiovascular care"
  });

  const familyMedicine = await db.orm.public.Department.create({
    name: "Family Medicine",
    description: "Primary and preventive care"
  });

  const pediatrics = await db.orm.public.Department.create({
    name: "Pediatrics",
    description: "Child and adolescent care"
  });

  const providers = await Promise.all([
    db.orm.public.Provider.create({
      firstName: "Aarav",
      lastName: "Sharma",
      email: "aarav.sharma@healthcare.local",
      phone: "204-555-1101",
      specialty: "Cardiologist",
      departmentId: cardiology.id
    }),

    db.orm.public.Provider.create({
      firstName: "Emily",
      lastName: "Carter",
      email: "emily.carter@healthcare.local",
      phone: "204-555-1102",
      specialty: "Family Physician",
      departmentId: familyMedicine.id
    }),

    db.orm.public.Provider.create({
      firstName: "Noah",
      lastName: "Wilson",
      email: "noah.wilson@healthcare.local",
      phone: "204-555-1103",
      specialty: "Pediatrician",
      departmentId: pediatrics.id
    })
  ]);

  const patients = await Promise.all([
    db.orm.public.Patient.create({
      firstName: "Sophia",
      lastName: "Brown",
      email: "sophia.brown@example.com",
      phone: "204-555-2101",
      dateOfBirth: "1992-04-11",
      gender: "Female",
      address: "Winnipeg, MB"
    }),

    db.orm.public.Patient.create({
      firstName: "Liam",
      lastName: "Martin",
      email: "liam.martin@example.com",
      phone: "204-555-2102",
      dateOfBirth: "1986-09-22",
      gender: "Male",
      address: "Winnipeg, MB"
    }),

    db.orm.public.Patient.create({
      firstName: "Olivia",
      lastName: "Singh",
      email: "olivia.singh@example.com",
      phone: "204-555-2103",
      dateOfBirth: "2014-01-08",
      gender: "Female",
      address: "Winnipeg, MB"
    }),

    db.orm.public.Patient.create({
      firstName: "Ethan",
      lastName: "Lee",
      email: "ethan.lee@example.com",
      phone: "204-555-2104",
      dateOfBirth: "1978-06-17",
      gender: "Male",
      address: "Winnipeg, MB"
    })
  ]);

  const now = new Date();

  await Promise.all([
    db.orm.public.Appointment.create({
      patientId: patients[0].id,
      providerId: providers[1].id,
      scheduledAt: new Date(
        now.getTime() + 60 * 60 * 1000
      ).toISOString(),
      status: "SCHEDULED",
      reason: "Annual wellness visit"
    }),

    db.orm.public.Appointment.create({
      patientId: patients[1].id,
      providerId: providers[0].id,
      scheduledAt: new Date(
        now.getTime() - 30 * 60 * 1000
      ).toISOString(),
      status: "WAITING",
      reason: "Cardiac follow-up",
      checkedInAt: new Date(
        now.getTime() - 15 * 60 * 1000
      ).toISOString()
    }),

    db.orm.public.Appointment.create({
      patientId: patients[2].id,
      providerId: providers[2].id,
      scheduledAt: new Date(
        now.getTime() - 2 * 60 * 60 * 1000
      ).toISOString(),
      status: "COMPLETED",
      reason: "Routine pediatric visit",
      checkedInAt: new Date(
        now.getTime() - 130 * 60 * 1000
      ).toISOString(),
      startedAt: new Date(
        now.getTime() - 120 * 60 * 1000
      ).toISOString(),
      completedAt: new Date(
        now.getTime() - 90 * 60 * 1000
      ).toISOString()
    }),

    db.orm.public.Appointment.create({
      patientId: patients[3].id,
      providerId: providers[1].id,
      scheduledAt: new Date(
        now.getTime() + 3 * 60 * 60 * 1000
      ).toISOString(),
      status: "SCHEDULED",
      reason: "Follow-up consultation"
    })
  ]);

  await db.orm.public.Notification.create({
    title: "High waiting time",
    message: "One patient has been waiting more than 15 minutes.",
    isRead: false
  });

  console.log("Seed completed successfully");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});