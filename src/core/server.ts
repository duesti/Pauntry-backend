import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { appConfig } from "@/configs/app.config";
import { env } from "@/configs/env.config";
import { router } from "@/core/router";
import { handleErrors } from "@/middlewares/error.middleware";
import { logger } from "@/utils/logger";

class Server {
	readonly app: Hono;
	private readonly router: Hono;

	private readonly port: number;
	private readonly hostname: string;

	constructor() {
		this.app = new Hono();
		this.router = router;

		this.port = env.PORT;
		this.hostname = env.HOSTNAME;

		this.configure();
	}

	private configure() {
		this.app.onError(handleErrors);

		this.app.get("/health", (ctx) => {
			return ctx.json({
				status: "up",
				version: appConfig.version,
				description: appConfig.description,
			});
		});

		this.app.route("/", this.router);
	}

	start() {
		serve(
			{
				fetch: this.app.fetch,
				port: this.port,
				hostname: this.hostname,
			},
			(info) => {
				logger.success(`Сервер запущен на ${info.port} порту.`);
			},
		);
	}
}

export { Server };
