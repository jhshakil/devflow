import { prisma } from "./lib/prisma";

async function main() {
  const userId = "test-user-id"; // We need a real user ID or a valid one

  // Try to find a user first
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("No user found in DB to test with.");
    process.exit(1);
  }

  try {
    const note = await prisma.note.create({
      data: {
        title: "Test Note",
        content: "Test Content",
        userId: user.id,
      },
    });
    console.log("Note created successfully:", note.id);
    process.exit(0);
  } catch (err) {
    console.error("Failed to create note in script:", err);
    process.exit(1);
  }
}

main();
