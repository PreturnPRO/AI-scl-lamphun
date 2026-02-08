import { Elysia } from "elysia";
import { authRoutes } from "./api/v2/auth";
import { deviceV2Routes } from "./api/v2/device";
import { initialize } from "./db/database";
import { startMainStreamSync } from "./services/mainStream";

export const db = initialize();

db
  .then((database) => {
    console.log("Database connected successfully");
    startMainStreamSync(database);
  })
  .catch((error) => {
    console.error("Failed to connect to the database", error);
  });

const app = new Elysia()
  .use(deviceV2Routes)
  .use(authRoutes)
  .get("/", () => "Hello Elysia")
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);