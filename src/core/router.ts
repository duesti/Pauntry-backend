import { Hono } from "hono";

import { photosController } from "@/modules/photos/photos.controller";

const router = new Hono();

router.route("/photos", photosController);

export { router };
