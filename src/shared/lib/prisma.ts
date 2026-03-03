import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/configs/env.config";
import { PrismaClient } from "@/generated/client";

const adapter = new PrismaPg({
	connectionString: env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export { prisma };
