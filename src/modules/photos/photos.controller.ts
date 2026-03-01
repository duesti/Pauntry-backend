import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import z, { maxSize } from "zod";
import {
	BadRequestError,
	RequestEntityTooLargeError,
} from "@/utils/http-errors";
import { uploadLimit } from "./photos.constants";
import { uploadSchema } from "./photos.schema";
import { photosService } from "./photos.service";

const photosController = new Hono();

photosController.post(
	"/",
	bodyLimit({
		maxSize: uploadLimit.MAX_BODY_SIZE,
		onError: (ctx) => {
			throw new RequestEntityTooLargeError(
				`Размер данных превышает ${maxSize} байт.`,
				ctx.req.path,
			);
		},
	}),
	zValidator("form", uploadSchema, (result, ctx) => {
		if (!result.success) {
			throw new BadRequestError(
				`Ошибка валидации: ${result.error.message}`,
				ctx.req.path,
			);
		}
	}),
	async (ctx) => {
		const { photos } = ctx.req.valid("form");

		const savedFiles = await photosService.uploadPhotos(photos);

		return ctx.json(
			{
				success: true,
				detail: "Файлы успешно загружены в S3 хранилище.",
				count: savedFiles.length,
			},
			201,
		);
	},
);

photosController.get(
	"/:s3key",
	zValidator(
		"param",
		z.object({
			s3key: z.string().min(1),
		}),
		(result, ctx) => {
			if (!result.success) {
				throw new BadRequestError(
					`Ошибка валидации: ${result.error.message}`,
					ctx.req.path,
				);
			}
		},
	),
	async (ctx) => {
		const { s3key } = ctx.req.valid("param");

		return ctx.json({
			success: true,
			url: await photosService.getPhoto(s3key),
		});
	},
);

photosController.delete(
	"/:s3key",
	zValidator(
		"param",
		z.object({
			s3key: z.string().min(1),
		}),
		(result, ctx) => {
			if (!result.success) {
				throw new BadRequestError(
					`Ошибка валидации: ${result.error.message}`,
					ctx.req.path,
				);
			}
		},
	),
	async (ctx) => {
		const { s3key } = ctx.req.valid("param");

		await photosService.deletePhoto(s3key);

		return ctx.json({
			success: true,
			detail: `Объект ${s3key} успешно удален с S3 хранилища.`,
		});
	},
);

export { photosController };
