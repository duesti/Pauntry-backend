import { randomUUID } from "node:crypto";
import { extname } from "node:path";
import { prisma } from "@/lib/prisma";
import { storageService } from "@/services/storage.service";
import { handleError } from "@/utils/catch-error";
import { InternalServerError, NotFoundError } from "@/utils/http-errors";
import { logger } from "@/utils/logger";

interface Photo {
	filename: string;
	url: string;
	size: number;
	contentType: string;
	albumId: string;
}

class PhotoService {
	private generateName() {
		return randomUUID();
	}

	private async getAlbum(albumId: string) {
		const album = await prisma.album.findUnique({
			where: {
				id: albumId,
			},
		});

		return album;
	}

	async uploadPhotos(photos: File[], albumId: string) {
		let uploadedPhotos: Photo[] = [];

		const isAlbumExists = await this.getAlbum(albumId);

		if (!isAlbumExists) {
			throw new NotFoundError(`Альбом ${albumId} не найден.`);
		}

		try {
			uploadedPhotos = await Promise.all(
				photos.map(async (photo) => {
					const { extension, filename, contentType, size } = {
						extension: extname(photo.name),
						filename: this.generateName(),
						contentType: photo.type,
						size: photo.size,
					};

					const arrayBuffer = await photo.arrayBuffer();
					const buffer = Buffer.from(arrayBuffer);

					const url = await storageService.putObject(
						filename,
						buffer,
						contentType,
					);

					return {
						url,
						filename,
						extension,
						contentType,
						size,
						albumId,
					};
				}),
			);

			return await prisma.photo.createManyAndReturn({
				data: uploadedPhotos,
			});
		} catch (e) {
			if (uploadedPhotos.length > 0) {
				const keys = uploadedPhotos.map((photo) => photo.filename);

				await Promise.allSettled(
					keys.map((key) => storageService.deleteObject(key)),
				);
			}

			handleError(e, "Ошибка при загрузке объекта в S3 хранилище");
		}
	}

	async getPhoto(key: string) {
		try {
			const photo = await prisma.photo.findUnique({
				where: {
					filename: key,
				},
			});

			if (!photo) {
				throw new NotFoundError(`Объект ${key} не найден.`);
			}

			return photo;
		} catch (e) {
			handleError(e, "Ошибка при получении объекта из S3 хранилища");
		}
	}

	async deletePhoto(key: string) {
		try {
			await this.getPhoto(key);

			const deletedPhoto = await prisma.photo.delete({
				where: {
					filename: key,
				},
			});

			await storageService.deleteObject(key);

			return deletedPhoto;
		} catch (e) {
			handleError(e, "Ошибка при удалении объекта из S3 хранилища");
		}
	}
}

export const photoService = new PhotoService();
