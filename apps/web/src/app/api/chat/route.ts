import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
	convertToModelMessages,
	streamText,
	type UIMessage,
	validateUIMessages,
} from "ai";
import { z } from "zod";

import { getPersonaById, personaIds } from "@/lib/personas";

export const maxDuration = 30;

const requestSchema = z.object({
	messages: z.array(z.unknown()),
	personaId: z.enum(personaIds),
});

async function getGoogleApiKey() {
	const { env } = await import("@persona-chat/env/server");
	return env.GOOGLE_API_KEY;
}

export async function POST(req: Request) {
	let body: unknown;

	try {
		body = await req.json();
	} catch {
		return Response.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	const parsed = requestSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json(
			{
				error: "Invalid request body. Expected messages and personaId.",
			},
			{ status: 400 }
		);
	}

	const apiKey = await getGoogleApiKey().catch(() => null);
	if (!apiKey) {
		return Response.json(
			{
				error: "Configuration error. Please contact the administrator.",
			},
			{ status: 500 }
		);
	}

	const persona = getPersonaById(parsed.data.personaId);
	const google = createGoogleGenerativeAI({ apiKey });

	let messages: UIMessage[];

	try {
		messages = await validateUIMessages<UIMessage>({
			messages: parsed.data.messages,
		});
	} catch {
		return Response.json(
			{
				error: "Invalid message payload.",
			},
			{ status: 400 }
		);
	}

	try {
		const result = streamText({
			model: google("gemini-2.5-flash"),
			messages: await convertToModelMessages(messages),
			system: persona.systemPrompt,
		});

		return result.toUIMessageStreamResponse();
	} catch {
		return Response.json(
			{
				error:
					"Sorry, I'm having trouble responding right now. Please try again.",
			},
			{ status: 500 }
		);
	}
}
