import { prisma } from "@/lib/prisma";
import { InternalServerError, NotFoundError } from "@/utils/http-errors";
import { logger } from "@/utils/logger";
import { handleError } from "@/utils/catch-error";

class AlbumService {
	async createAlbum(title?: string, description?: string) {
		try {
			const album = await prisma.album.create({
				data: {
					title,
					description,
				},
			});

			return album.id;
		} catch (e) {
			handleError(e, "Ошибка при создании альбома")
		}
	}

	async getAlbum(albumId: string) {
		try {
			const album = await prisma.album.findUnique({
				where: {
					id: albumId,
				},
			});

			if (!album) {
				throw new NotFoundError(`Альбом ${albumId} не найден.`);
			}

			return album;
		} catch (e) {
			handleError(e, "Ошибка при получении альбома")
		}
	}
}

export const albumService = new AlbumService();
