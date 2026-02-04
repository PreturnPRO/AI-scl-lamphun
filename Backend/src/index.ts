import { Elysia } from "elysia";
import { initialize } from "./db/database";

export const db = initialize();

if (db) {
  console.log("Database connected successfully");
} else {
  console.error("Failed to connect to the database");
}

const app = new Elysia().get("/", () => "Hello Elysia").listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);