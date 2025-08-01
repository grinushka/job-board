import { env } from "@/data/env/server";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/drizzle/schema";

console.log(env.DATABASE_URL);
export const db = drizzle(env.DATABASE_URL, { schema });