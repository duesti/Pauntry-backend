import { z } from "zod";

const getAlbumSchema = z.object({
	albumId: z.string().min(1),
});

const createAlbumSchema = z.object({
	title: z.string().optional(),
	description: z.string().optional(),
});

export { getAlbumSchema, createAlbumSchema };
