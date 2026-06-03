// Seed the database with a few sample notices so the live demo isn't empty.
// Run with: npx prisma db seed
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Dates are relative to "now" so the demo always looks current.
const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

const notices = [
  {
    title: "Semester exam timetable released",
    body: "The end-semester examination timetable is now available. Please check your schedule and report 30 minutes before each exam.",
    category: "Exam",
    priority: "Urgent",
    publishDate: daysFromNow(2),
    imageUrl: "https://picsum.photos/seed/exam/600/400",
  },
  {
    title: "Campus closed for maintenance",
    body: "The campus will remain closed this weekend for scheduled electrical maintenance. Plan your visits accordingly.",
    category: "General",
    priority: "Urgent",
    publishDate: daysFromNow(1),
    imageUrl: null,
  },
  {
    title: "Annual cultural fest - registrations open",
    body: "Get ready for the biggest event of the year! Registrations for performances, stalls and competitions are now open.",
    category: "Event",
    priority: "Normal",
    publishDate: daysFromNow(7),
    imageUrl: "https://picsum.photos/seed/fest/600/400",
  },
  {
    title: "Library hours extended during exams",
    body: "The central library will stay open until midnight throughout the examination period to support late-night study.",
    category: "General",
    priority: "Normal",
    publishDate: daysFromNow(3),
    imageUrl: null,
  },
  {
    title: "Guest lecture on Artificial Intelligence",
    body: "Join us for an insightful guest lecture on the future of AI, hosted in the main auditorium. Open to all students.",
    category: "Event",
    priority: "Normal",
    publishDate: daysFromNow(5),
    imageUrl: "https://picsum.photos/seed/ai/600/400",
  },
  {
    title: "Re-evaluation results published",
    body: "Results for re-evaluation requests from last semester have been published on the student portal.",
    category: "Exam",
    priority: "Normal",
    publishDate: daysFromNow(-2),
    imageUrl: null,
  },
];

async function main() {
  // Start clean so re-running the seed is predictable.
  await prisma.notice.deleteMany();
  await prisma.notice.createMany({ data: notices });
  console.log(`Seeded ${notices.length} notices.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
