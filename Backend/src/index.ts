import { Elysia } from "elysia";
import { authRoutes } from "./api/v2/auth";
import { deviceV2Routes } from "./api/v2/device";
import { userRoutes } from "./api/v2/user";
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
  .use(userRoutes)
  .get("/", () => "Hello Elysia")
  .listen({ port: 3000, hostname: "0.0.0.0" });

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);