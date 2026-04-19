import { PrismaClient } from "./lib/generated/client";
import "dotenv/config";

async function main() {
  console.log("Testing database connection...");
  console.log(
    "DATABASE_URL start:",
    process.env.DATABASE_URL?.substring(0, 15),
    "...",
  );

  const prisma = new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });

  try {
    await prisma.$connect();
    console.log("Connection successful!");
    const userCount = await prisma.user.count();
    console.log("User count:", userCount);
  } catch (error) {
    console.error("Connection failed:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
