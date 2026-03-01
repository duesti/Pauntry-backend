import { z } from "zod";
import { logger } from "@/utils/logger";

const envSchema = z.object({
	// Server
	HOSTNAME: z.string().min(1),
	PORT: z.coerce.number().min(1),

	// S3 Storage
	S3_ENDPOINT: z.string().min(1),
	S3_REGION: z.string().min(1),
	S3_ACCESS_KEY: z.string().min(1),
	S3_SECRET_KEY: z.string().min(1),
	S3_BUCKET_NAME: z.string().min(1),
	S3_PUBLIC_ENDPOINT: z.string().min(1),
});

const envParsed = envSchema.safeParse(Bun.env);

if (!envParsed.success) {
	logger.error("Невалидная конфигурация");

	envParsed.error.issues.forEach((issue) => {
		logger.error(`* ${issue.path.join(".")}: ${issue.message}`);
	});

	process.exit(1);
}

export const env = envParsed.data;
