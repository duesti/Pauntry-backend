import { beforeEach, describe, expect, test } from "bun:test";
import {
	DeleteObjectCommand,
	HeadObjectCommand,
	PutObjectCommand,
	S3Client,
	S3ServiceException,
} from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";
import { Server } from "@/core/server";
import { InternalServerError } from "@/utils/http-errors";

const server = new Server();
const app = server.app;
const s3Client = mockClient(S3Client);

// Test for /photos route, that contain:
// 200, 404, 201, 400, 500 statuses.

const mockFormData = () => {
	const formData = new FormData();

	const mockPhoto = new File(["mock-blob-part"], "mock.png", {
		type: "image/png",
	});

	formData.append("photos", mockPhoto);

	return formData;
};

describe("Testing /photos route", () => {
	beforeEach(() => {
		s3Client.reset();
	});

	test("Should return object's public url", async () => {
		s3Client.on(HeadObjectCommand).resolves({});

		const response = await app.request("/photos/mock.jpg", {
			method: "GET",
		});

		expect(response.status).toBe(200);
		expect(s3Client.commandCalls(HeadObjectCommand)).toHaveLength(1);
	});

	test("Should upload a photo to S3 storage", async () => {
		s3Client.on(PutObjectCommand).resolves({});

		const formData = mockFormData();

		const response = await app.request("/photos", {
			method: "POST",
			body: formData,
		});

		expect(response.status).toBe(201);
		expect(s3Client.commandCalls(PutObjectCommand)).toHaveLength(1);
	});

	test("Should delete object from S3 storage", async () => {
		s3Client.on(DeleteObjectCommand).resolves({});

		const response = await app.request("/photos/mock.jpg", {
			method: "DELETE",
		});

		expect(response.status).toBe(200);
		expect(s3Client.commandCalls(DeleteObjectCommand)).toHaveLength(1);
	});

	test("Should provide 404 if photo not found in S3 storage", async () => {
		const notFoundError = new S3ServiceException({
			$fault: "client",
			$metadata: {
				httpStatusCode: 404,
			},
			name: "NotFound",
		});

		s3Client.on(HeadObjectCommand).rejects(notFoundError);

		const response = await app.request("/photos/error", {
			method: "GET",
		});

		expect(response.status).toBe(404);
	});

	test("Should provide 400 if request body is invalid", async () => {
		const formData = new FormData();

		const response = await app.request("/photos", {
			method: "POST",
			body: formData,
		});

		expect(response.status).toBe(400);
		expect(s3Client.commandCalls(PutObjectCommand)).toHaveLength(0);
	});

	test("Should provide 500 if S3 is unavaible", async () => {
		const internalServerError = new InternalServerError(
			"S3 хранилище не доступно.",
		);
		s3Client.on(PutObjectCommand).rejects(internalServerError);

		const formData = mockFormData();

		const response = await app.request("/photos", {
			method: "POST",
			body: formData,
		});

		expect(response.status).toBe(500);
	});
});
