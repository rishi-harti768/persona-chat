import { env } from "@persona-chat/env/server";
import { drizzle } from "drizzle-orm/node-postgres";

import { conversations } from "./schema";

export const schema = { conversations };

export function createDb() {
	return drizzle(env.DATABASE_URL, { schema });
}

export const db = createDb();
