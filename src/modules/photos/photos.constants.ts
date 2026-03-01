const uploadFileLimit = {
	MAX_FILE_SIZE: 20 * 1024 * 1024,
	MAX_FILES_COUNT: 150,
	ACCEPTED_FILE_FORMATS: ["image/png", "image/jpeg", "image/jpg", "image/webm"],
};

const uploadLimit = {
	MAX_BODY_SIZE:
		uploadFileLimit.MAX_FILE_SIZE * uploadFileLimit.MAX_FILES_COUNT,
};

export { uploadFileLimit, uploadLimit };
