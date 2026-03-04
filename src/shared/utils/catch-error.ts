import { HttpError, InternalServerError } from "@/utils/http-errors";
import { logger } from "@/utils/logger";

const handleError = (error: unknown, detail?: string) => {
	let errorMessage = "Неизвестная ошибка";

	if (error instanceof Error) {
		errorMessage = error.message;
	}

	if (error instanceof HttpError) {
		throw error;
	}

	logger.error(detail ? `${detail}: ${errorMessage}` : errorMessage);

	throw new InternalServerError();
};

export { handleError };
