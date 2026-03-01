import {
	DeleteObjectCommand,
	HeadObjectCommand,
	ListObjectsV2Command,
	PutObjectCommand,
	S3Client,
	S3ServiceException,
} from "@aws-sdk/client-s3";

import { env } from "@/configs/env.config";
import { InternalServerError, NotFoundError } from "@/utils/http-errors";
import { logger } from "@/utils/logger";

class StorageService {
	private readonly client: S3Client;
	private readonly bucket: string;

	constructor() {
		this.client = new S3Client({
			endpoint: env.S3_ENDPOINT,
			credentials: {
				accessKeyId: env.S3_ACCESS_KEY,
				secretAccessKey: env.S3_SECRET_KEY,
			},
			region: env.S3_REGION,
		});

		this.bucket = env.S3_BUCKET_NAME;
	}

	// Getting list of objects from S3 storage
	async getListObjects() {
		const command = new ListObjectsV2Command({
			Bucket: this.bucket,
		});

		try {
			return await this.client.send(command);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Unknown error";

			logger.error(
				`Error while fetching objects list from S3: ${errorMessage}`,
			);

			throw new InternalServerError(errorMessage);
		}
	}

	// Putting object to S3 storage
	async putObject(
		key: string,
		object: Buffer | Uint8Array | string,
		contentType: string,
	) {
		const command = new PutObjectCommand({
			Bucket: this.bucket,
			Key: key,
			Body: object,
			ContentType: contentType,
		});

		try {
			await this.client.send(command);

			return `${env.S3_PUBLIC_ENDPOINT}/${key}`;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Unknown error";

			logger.error(`Error while putting object to S3: ${errorMessage}`);

			throw new InternalServerError(errorMessage);
		}
	}

	// Getting object from S3 storage
	async getObject(key: string) {
		const isExists = await this.headObject(key);

		if (!isExists) {
			throw new NotFoundError(`File ${key} not found in S3`);
		}

		return `${env.S3_PUBLIC_ENDPOINT}/${key}`;
	}

	// Check if object exist in S3 storage
	private async headObject(key: string) {
		const command = new HeadObjectCommand({
			Bucket: this.bucket,
			Key: key,
		});

		try {
			await this.client.send(command);

			return true;
		} catch (err) {
			if (
				err instanceof S3ServiceException &&
				err.$metadata.httpStatusCode === 404
			) {
				return false;
			}

			const errorMessage = err instanceof Error ? err.message : "Unknown error";
			logger.error(`Error while heading object from S3: ${errorMessage}`);
			throw new InternalServerError(errorMessage);
		}
	}

	// Deleting object from S3 storage
	async deleteObject(key: string) {
		const isExists = await this.headObject(key);

		if (!isExists) {
			throw new NotFoundError(`File ${key} not found in S3`);
		}

		const command = new DeleteObjectCommand({
			Bucket: this.bucket,
			Key: key,
		});

		try {
			return await this.client.send(command);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Unknown error";

			logger.error(`Error while deleting object from S3: ${errorMessage}`);

			throw new InternalServerError(errorMessage);
		}
	}
}

export const storageService = new StorageService();
