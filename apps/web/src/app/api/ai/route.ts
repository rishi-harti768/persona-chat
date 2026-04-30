import { google } from "@ai-sdk/google";
import {
	convertToModelMessages,
	streamText,
	type UIMessage,
	validateUIMessages,
} from "ai";
import { z } from "zod";

export const maxDuration = 30;

const requestSchema = z.object({
	messages: z.array(z.unknown()),
});

export async function POST(req: Request) {
	let body: unknown;

	try {
		body = await req.json();
	} catch {
		return Response.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	const parsed = requestSchema.safeParse(body);

	if (!parsed.success) {
		return Response.json({ error: "Invalid request body" }, { status: 400 });
	}

	try {
		const messages = await validateUIMessages<UIMessage>({
			messages: parsed.data.messages,
		});

		const result = streamText({
			model: google("gemini-2.5-flash"),
			messages: await convertToModelMessages(messages),
		});

		return result.toUIMessageStreamResponse();
	} catch {
		return Response.json({ error: "Invalid message payload" }, { status: 400 });
	}
}
