import { PrismaClient } from "../lib/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Create Demo User
  const user = await prisma.user.upsert({
    where: { email: "demo@devflow.com" },
    update: {},
    create: {
      email: "demo@devflow.com",
      name: "Demo User",
      password: hashedPassword,
    },
  });

  // 2. Create Projects
  const project1 = await prisma.project.create({
    data: {
      name: "DevFlow App",
      description: "Main development project for the productivity tool.",
      color: "#6366f1",
      userId: user.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "Personal Portfolio",
      description: "Modern portfolio website building.",
      color: "#ec4899",
      userId: user.id,
    },
  });

  // 3. Create Tasks
  await prisma.task.createMany({
    data: [
      {
        title: "Implement Time Tracking",
        description: "Add start/pause/stop functionality.",
        status: "IN_PROGRESS",
        priority: "CRITICAL",
        progress: 65,
        projectId: project1.id,
        userId: user.id,
        dueDate: new Date(Date.now() + 86400000), // Tomorrow
      },
      {
        title: "Setup PostgreSQL",
        description: "Configure local DB and Prisma migrations.",
        status: "DONE",
        priority: "HIGH",
        progress: 100,
        projectId: project1.id,
        userId: user.id,
        completedAt: new Date(),
      },
      {
        title: "Design Landing Page",
        description: "Create a beautiful hero section.",
        status: "TODO",
        priority: "MEDIUM",
        progress: 0,
        projectId: project2.id,
        userId: user.id,
      },
    ],
  });

  // 4. Create Deadlines
  await prisma.deadline.createMany({
    data: [
      {
        title: "v1.0 Milestone",
        dueDate: new Date(Date.now() + 172800000), // 2 days from now
        projectId: project1.id,
      },
      {
        title: "Design Handoff",
        dueDate: new Date(Date.now() - 3600000), // 1 hour ago (overdue)
        projectId: project2.id,
      },
    ],
  });

  // 5. Create Notes
  await prisma.note.createMany({
    data: [
      {
        title: "Prisma Optimization Tips",
        content:
          "# Optimization\n\n- Use `select` to avoid fetching large blobs\n- Use `findMany` with pagination\n- Batch updates in transactions",
        tags: ["database", "prisma", "performance"],
        projectId: project1.id,
        userId: user.id,
      },
    ],
  });

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
