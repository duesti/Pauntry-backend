import type { Context } from "hono";
import type { HTTPResponseError } from "hono/types";
import type { StatusCode } from "hono/utils/http-status";
import { HttpError, InternalServerError } from "@/utils/http-errors";
import { logger } from "@/utils/logger";

const handleErrors = async (error: Error | HTTPResponseError, ctx: Context) => {
	let currentError: HttpError;

	if (error instanceof HttpError) {
		currentError = error;
	} else {
		logger.error(`Unhandled error: ${error.message}`);

		currentError = new InternalServerError(
			"Непредвиденная ошибка",
			ctx.req.path,
		);
	}

	ctx.status(currentError.status as StatusCode);

	const errorStack = {
		type: currentError.type,
		title: currentError.title,
		status: currentError.status,
		detail: currentError.detail,
		instance: currentError.instance,
	} as const;

	logger.error(errorStack);

	return ctx.json(errorStack);
};

export { handleErrors };
