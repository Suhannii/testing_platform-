/**
 * Database seed script
 *
 * Creates:
 *  - 1 Admin user
 *  - 1 Student user
 *  - 3 published tests across different subjects/courses with sample questions
 *
 * Run with: npx prisma db seed
 *
 * Default credentials:
 *   Admin  → admin@test.com  / admin123
 *   Student → user@test.com  / user123
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ── Users ──────────────────────────────────────────────────────────────────

  const adminPassword = await bcrypt.hash("admin123", 12);
  const userPassword = await bcrypt.hash("user123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@test.com",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "user@test.com" },
    update: {},
    create: {
      name: "Test Student",
      email: "user@test.com",
      passwordHash: userPassword,
      role: "USER",
    },
  });

  // ── Test 1: Mathematics — Algebra ─────────────────────────────────────────

  const mathTest = await prisma.test.upsert({
    where: { id: "seed-test-math" },
    update: {},
    create: {
      id: "seed-test-math",
      title: "Algebra Fundamentals",
      description: "Basic algebra concepts including equations and expressions.",
      subject: "Mathematics",
      course: "B.Sc Year 1",
      durationMinutes: 20,
      isPublished: true,
      createdBy: admin.id,
    },
  });

  const mathQuestions = [
    {
      text: "What is the value of x in the equation 2x + 4 = 10?",
      type: "OBJECTIVE",
      order: 1,
      topicTag: "Linear Equations",
      options: [
        { text: "2", isCorrect: false },
        { text: "3", isCorrect: true },
        { text: "4", isCorrect: false },
        { text: "5", isCorrect: false },
      ],
    },
    {
      text: "Which of the following is a quadratic equation?",
      type: "OBJECTIVE",
      order: 2,
      topicTag: "Quadratic Equations",
      options: [
        { text: "3x + 2 = 0", isCorrect: false },
        { text: "x² + 5x + 6 = 0", isCorrect: true },
        { text: "2x - 7 = 0", isCorrect: false },
        { text: "x/2 = 4", isCorrect: false },
      ],
    },
    {
      text: "What is the slope of the line y = 3x + 7?",
      type: "OBJECTIVE",
      order: 3,
      topicTag: "Linear Functions",
      options: [
        { text: "7", isCorrect: false },
        { text: "3", isCorrect: true },
        { text: "1/3", isCorrect: false },
        { text: "-3", isCorrect: false },
      ],
    },
    {
      text: "Explain what a variable is in algebra and give an example of how it is used in an equation.",
      type: "SUBJECTIVE",
      order: 4,
      topicTag: "Basics",
      keywords: ["variable", "unknown", "equation", "symbol", "value"],
    },
  ];

  for (const q of mathQuestions) {
    const existing = await prisma.question.findFirst({
      where: { testId: mathTest.id, order: q.order },
    });
    if (!existing) {
      await prisma.question.create({
        data: {
          testId: mathTest.id,
          type: q.type,
          text: q.text,
          order: q.order,
          topicTag: q.topicTag,
          options: q.options
            ? { create: q.options }
            : undefined,
          keywords: q.keywords
            ? { create: q.keywords.map((w) => ({ word: w })) }
            : undefined,
        },
      });
    }
  }

  // ── Test 2: Science — Biology ──────────────────────────────────────────────

  const bioTest = await prisma.test.upsert({
    where: { id: "seed-test-bio" },
    update: {},
    create: {
      id: "seed-test-bio",
      title: "Cell Biology Basics",
      description: "Covers cell structure, function, and processes.",
      subject: "Biology",
      course: "B.Sc Year 1",
      durationMinutes: 25,
      isPublished: true,
      createdBy: admin.id,
    },
  });

  const bioQuestions = [
    {
      text: "Which organelle is known as the powerhouse of the cell?",
      type: "OBJECTIVE",
      order: 1,
      topicTag: "Cell Organelles",
      options: [
        { text: "Nucleus", isCorrect: false },
        { text: "Ribosome", isCorrect: false },
        { text: "Mitochondria", isCorrect: true },
        { text: "Golgi Apparatus", isCorrect: false },
      ],
    },
    {
      text: "What is the function of the cell membrane?",
      type: "OBJECTIVE",
      order: 2,
      topicTag: "Cell Structure",
      options: [
        { text: "Produces energy", isCorrect: false },
        { text: "Controls what enters and exits the cell", isCorrect: true },
        { text: "Stores genetic information", isCorrect: false },
        { text: "Synthesises proteins", isCorrect: false },
      ],
    },
    {
      text: "Which process do plants use to make their own food?",
      type: "OBJECTIVE",
      order: 3,
      topicTag: "Photosynthesis",
      options: [
        { text: "Respiration", isCorrect: false },
        { text: "Fermentation", isCorrect: false },
        { text: "Photosynthesis", isCorrect: true },
        { text: "Digestion", isCorrect: false },
      ],
    },
    {
      text: "Describe the process of photosynthesis and name the key substances involved.",
      type: "SUBJECTIVE",
      order: 4,
      topicTag: "Photosynthesis",
      keywords: ["sunlight", "chlorophyll", "carbon dioxide", "water", "glucose", "oxygen"],
    },
    {
      text: "What is the role of DNA in a cell?",
      type: "SUBJECTIVE",
      order: 5,
      topicTag: "Genetics",
      keywords: ["genetic", "information", "protein", "heredity", "nucleus", "instructions"],
    },
  ];

  for (const q of bioQuestions) {
    const existing = await prisma.question.findFirst({
      where: { testId: bioTest.id, order: q.order },
    });
    if (!existing) {
      await prisma.question.create({
        data: {
          testId: bioTest.id,
          type: q.type,
          text: q.text,
          order: q.order,
          topicTag: q.topicTag,
          options: q.options ? { create: q.options } : undefined,
          keywords: q.keywords
            ? { create: q.keywords.map((w) => ({ word: w })) }
            : undefined,
        },
      });
    }
  }

  // ── Test 3: Computer Science — Programming ─────────────────────────────────

  const csTest = await prisma.test.upsert({
    where: { id: "seed-test-cs" },
    update: {},
    create: {
      id: "seed-test-cs",
      title: "Introduction to Programming",
      description: "Fundamental programming concepts and problem solving.",
      subject: "Computer Science",
      course: "BCA Year 1",
      durationMinutes: 30,
      isPublished: true,
      createdBy: admin.id,
    },
  });

  const csQuestions = [
    {
      text: "Which of the following is NOT a programming language?",
      type: "OBJECTIVE",
      order: 1,
      topicTag: "Languages",
      options: [
        { text: "Python", isCorrect: false },
        { text: "HTML", isCorrect: false },
        { text: "Java", isCorrect: false },
        { text: "Microsoft Word", isCorrect: true },
      ],
    },
    {
      text: "What does CPU stand for?",
      type: "OBJECTIVE",
      order: 2,
      topicTag: "Hardware",
      options: [
        { text: "Central Processing Unit", isCorrect: true },
        { text: "Computer Personal Unit", isCorrect: false },
        { text: "Central Program Utility", isCorrect: false },
        { text: "Core Processing Utility", isCorrect: false },
      ],
    },
    {
      text: "In programming, what is a loop used for?",
      type: "OBJECTIVE",
      order: 3,
      topicTag: "Control Flow",
      options: [
        { text: "To store data", isCorrect: false },
        { text: "To repeat a block of code multiple times", isCorrect: true },
        { text: "To define a variable", isCorrect: false },
        { text: "To end a program", isCorrect: false },
      ],
    },
    {
      text: "What is the difference between a compiler and an interpreter?",
      type: "SUBJECTIVE",
      order: 4,
      topicTag: "Compilation",
      keywords: ["compiler", "interpreter", "translate", "source code", "execute", "machine code"],
    },
    {
      text: "Explain what an algorithm is and why it is important in programming.",
      type: "SUBJECTIVE",
      order: 5,
      topicTag: "Algorithms",
      keywords: ["algorithm", "steps", "problem", "solution", "instructions", "logic"],
    },
    {
      text: "What is a variable in programming?",
      type: "OBJECTIVE",
      order: 6,
      topicTag: "Variables",
      options: [
        { text: "A fixed value that never changes", isCorrect: false },
        { text: "A named storage location that holds a value", isCorrect: true },
        { text: "A type of loop", isCorrect: false },
        { text: "A function that returns data", isCorrect: false },
      ],
    },
  ];

  for (const q of csQuestions) {
    const existing = await prisma.question.findFirst({
      where: { testId: csTest.id, order: q.order },
    });
    if (!existing) {
      await prisma.question.create({
        data: {
          testId: csTest.id,
          type: q.type,
          text: q.text,
          order: q.order,
          topicTag: q.topicTag,
          options: q.options ? { create: q.options } : undefined,
          keywords: q.keywords
            ? { create: q.keywords.map((w) => ({ word: w })) }
            : undefined,
        },
      });
    }
  }

  console.log("✓ Seeded users:", admin.email, "|", student.email);
  console.log("✓ Seeded tests:", mathTest.title, "|", bioTest.title, "|", csTest.title);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
