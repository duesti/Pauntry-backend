import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { BadRequestError } from "@/utils/http-errors";
import { createAlbumSchema, getAlbumSchema } from "./albums.schema";
import { albumService } from "./albums.service";

const albumsController = new Hono();

albumsController.post(
	"/",
	zValidator("json", createAlbumSchema, (result, ctx) => {
		if (!result.success) {
			throw new BadRequestError("Переданное тело невалидно", ctx.req.path);
		}
	}),
	async (ctx) => {
		const { title, description } = ctx.req.valid("json");

		const albumId = await albumService.createAlbum(title, description);

		return ctx.json({
			albumId,
		});
	},
);

albumsController.get(
	"/:albumId",
	zValidator(
		"param",
		z.object({
			albumId: z.string().min(1),
		}),
		(result, ctx) => {
			if (!result.success) {
				throw new BadRequestError(
					"Переданные параметры невалидны",
					ctx.req.path,
				);
			}
		},
	),
	async (ctx) => {
		const { albumId } = ctx.req.valid("param");

		const album = await albumService.getAlbum(albumId);

		return ctx.json({
			title: album?.title,
			description: album?.description,
			id: album?.id,
		});
	},
);

export { albumsController };
