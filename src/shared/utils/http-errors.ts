class HttpError extends Error {
	constructor(
		public readonly status: number,
		public readonly title: string,
		public readonly detail?: string,
		public readonly instance?: string,
		public readonly type: string = "about:blank",
	) {
		super(detail);

		this.name = "HttpError";
	}
}

class InternalServerError extends HttpError {
	constructor(
		detail?: string,
		instance?: string,
		type?: string,
		title: string = "Внутренняя ошибка сервера",
	) {
		super(500, title, detail, instance, type);
	}
}

class RequestEntityTooLargeError extends HttpError {
	constructor(
		detail?: string,
		instance?: string,
		type?: string,
		title: string = "Размер отправляемых данных слишком большой",
	) {
		super(413, title, detail, instance, type);
	}
}

class BadRequestError extends HttpError {
	constructor(
		detail?: string,
		instance?: string,
		type?: string,
		title: string = "Ошибка на стороне клиента",
	) {
		super(400, title, detail, instance, type);
	}
}

class NotFoundError extends HttpError {
	constructor(
		detail?: string,
		instance?: string,
		type?: string,
		title: string = "Не найдено",
	) {
		super(404, title, detail, instance, type);
	}
}

export {
	HttpError,
	InternalServerError,
	RequestEntityTooLargeError,
	BadRequestError,
	NotFoundError,
};
