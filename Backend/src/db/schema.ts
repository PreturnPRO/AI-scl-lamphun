import { mysqlTable, serial, varchar } from "drizzle-orm/mysql-core";

export const devies = mysqlTable("devices", {
    id: serial("id").primaryKey(),
    secretId: varchar("secretId", { length: 255 }).unique(),
    deviceKey: varchar("deviceKey", { length: 255 }),
    monitorItem: varchar("monitorItem", { length: 255 }),
    customName: varchar("customName", { length: 255 }),
    deviceName: varchar("deviceName", { length: 255 }),
    latitude: varchar("latitude", { length: 100 }),
    longitude: varchar("longitude", { length: 100 })
})

export const users = mysqlTable("users", {
    id: serial("id").primaryKey(),
    firstname: varchar("firstname", { length: 255 }),
    lastname: varchar("lastname", { length: 255 }),
    username: varchar("username", { length: 255 }).unique(),
    email: varchar("email", { length: 255 }).unique(),
    role: varchar("role", { length: 100 }),
    password: varchar("password", { length: 255 })
});

export const sessions = mysqlTable("sessions", {
    id: serial("id").primaryKey(),
    userId: serial("user_id").references(() => users.id),
    token: varchar("token", { length: 255 }).unique(),
    expires_at: varchar("expires_at", { length: 100 })
})