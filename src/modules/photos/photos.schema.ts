import { z } from "zod";
import { uploadFileLimit } from "./photos.constants";

const photoSchema = z
	.custom<File>((photo) => photo instanceof File, "Ожидается файлы.")
	.refine(
		(photo) => photo.size <= uploadFileLimit.MAX_FILE_SIZE,
		"Размер одного файла не должен превышать 20 МБ.",
	)
	.refine(
		(photo) => uploadFileLimit.ACCEPTED_FILE_FORMATS.includes(photo.type),
		"Поддерживается только .png .jpeg .jpg и .webm",
	);

const uploadSchema = z.object({
	photos: z.preprocess(
		(photos) => (Array.isArray(photos) ? photos : [photos]),
		z
			.array(photoSchema)
			.min(1, "Необходимо загрузить хотя бы 1 файл.")
			.max(
				uploadFileLimit.MAX_FILES_COUNT,
				`Количество файлов превышает ${uploadFileLimit.MAX_FILES_COUNT}`,
			),
	),
	albumId: z.string()
});

export { photoSchema, uploadSchema };
