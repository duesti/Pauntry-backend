import { z } from "zod";
import { logger } from "@/utils/logger";

const envSchema = z.object({
	HOSTNAME: z.string().min(1, "Переменная HOSTNAME не может быть пустой."),
	PORT: z.coerce.number().min(1, "Переменная PORT не может быть пустой"),
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
