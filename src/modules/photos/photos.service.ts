import { randomBytes } from "node:crypto";
import { storageService } from "@/services/storage.service";
import { InternalServerError } from "@/shared/utils/http-errors";
import { logger } from "@/utils/logger";

class PhotosService {
	private generateName(length: number = 12) {
		return randomBytes(length).toString("hex");
	}

	async uploadPhotos(photos: File[]) {
		try {
			const uploadPromises = photos.map(async (photo) => {
				const ext = photo.name.split(".").at(-1);
				const newFileName = `${this.generateName()}.${ext}`;

				const arrayBuffer = await photo.arrayBuffer();
				const buffer = Buffer.from(arrayBuffer);

				const uploadedUrl = await storageService.putObject(
					newFileName,
					buffer,
					photo.type,
				);

				return {
					originalName: photo.name,
					filename: newFileName,
					s3key: newFileName,
					url: uploadedUrl,
					size: photo.size,
					type: photo.type,
				};
			});

			return await Promise.all(uploadPromises);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Unknown error";
			logger.error(`Error while uploading photos to S3: ${errorMessage}`);

			throw new InternalServerError(errorMessage);
		}
	}

	async getPhoto(key: string) {
		return await storageService.getObject(key);
	}

	async deletePhoto(key: string) {
		return await storageService.deleteObject(key);
	}
}

export const photosService = new PhotosService();
