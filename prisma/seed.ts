import { ensureDemoData } from "@/lib/db/demo-seed";
import { prisma } from "@/lib/db/prisma";

async function main() {
  await ensureDemoData();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
