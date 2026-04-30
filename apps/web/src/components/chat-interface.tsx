"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Square } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { PersonaDefinition, PersonaState } from "@/lib/personas";
import { getSuggestionsForPersona } from "@/lib/suggestions";
import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
} from "./ai-elements/conversation";
import {
	Message,
	MessageContent,
	MessageResponse,
} from "./ai-elements/message";
import {
	PromptInput,
	type PromptInputStatus,
	PromptInputSubmit,
	PromptInputTextarea,
} from "./ai-elements/prompt-input";
import { Suggestion, Suggestions } from "./ai-elements/suggestion";

function getPersonaState(status: PromptInputStatus): PersonaState {
	switch (status) {
		case "submitted":
			return "thinking";
		case "streaming":
			return "speaking";
		default:
			return "idle";
	}
}

function getErrorMessage(error: Error | undefined) {
	if (!error) {
		return null;
	}

	const normalizedMessage = error.message.toLowerCase();
	if (
		normalizedMessage.includes("fetch") ||
		normalizedMessage.includes("network") ||
		normalizedMessage.includes("failed to fetch")
	) {
		return "Connection error. Please check your internet and try again.";
	}

	return (
		error.message ||
		"Sorry, I'm having trouble responding right now. Please try again."
	);
}

export function ChatInterface({
	persona,
	onStatusChange,
}: {
	persona: PersonaDefinition;
	onStatusChange: (status: PersonaState) => void;
}) {
	const [input, setInput] = useState("");
	const transport = useMemo(
		() =>
			new DefaultChatTransport({
				api: "/api/chat",
				body: {
					personaId: persona.id,
				},
			}),
		[persona.id]
	);

	const { messages, sendMessage, status, error, stop } = useChat({
		transport,
	});

	const currentState = getPersonaState(status);

	useEffect(() => {
		onStatusChange(currentState);
	}, [currentState, onStatusChange]);

	const suggestions = getSuggestionsForPersona(persona.id);
	const errorMessage = getErrorMessage(error);
	const isBusy = status === "submitted" || status === "streaming";
	const hasMessages = messages.length > 0;

	return (
		<div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border bg-card shadow-sm">
			<div className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-6">
				<div>
					<div className="font-semibold text-base">{persona.name}</div>
					<div className="text-muted-foreground text-sm">
						{persona.description}
					</div>
				</div>
				<div className="flex items-center gap-2">
					<span className="hidden text-muted-foreground text-sm sm:inline">
						{status}
					</span>
					{isBusy ? (
						<button
							className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm transition-colors hover:bg-muted"
							onClick={() => {
								stop().catch(() => undefined);
							}}
							type="button"
						>
							<Square className="size-3.5" />
							Stop
						</button>
					) : null}
				</div>
			</div>

			<div className="min-h-0 flex-1 overflow-hidden">
				<Conversation className="h-full min-h-0">
					<ConversationContent messageCount={messages.length}>
						{errorMessage ? (
							<div
								className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-destructive text-sm"
								role="alert"
							>
								{errorMessage}
							</div>
						) : null}

						{hasMessages ? null : (
							<div className="rounded-2xl border border-border border-dashed bg-muted/20 px-4 py-8 text-center text-muted-foreground text-sm">
								Start with one of the suggestions below or ask your own
								question.
							</div>
						)}

						{messages.map((message) => (
							<Message
								from={message.role === "user" ? "user" : "assistant"}
								key={message.id}
							>
								<MessageContent>
									{message.parts.map((part, index) => {
										if (part.type !== "text") {
											return null;
										}

										return (
											<MessageResponse key={`${message.id}-${index}`}>
												{part.text}
											</MessageResponse>
										);
									})}
								</MessageContent>
							</Message>
						))}

						{hasMessages ? null : (
							<div className="space-y-3">
								<div className="font-medium text-sm">Quick starts</div>
								<Suggestions>
									{suggestions.map((suggestion) => (
										<Suggestion
											key={suggestion}
											onClick={(text) => {
												if (isBusy) {
													return;
												}

												sendMessage({ text }).catch(() => undefined);
												setInput("");
											}}
											suggestion={suggestion}
										/>
									))}
								</Suggestions>
							</div>
						)}
					</ConversationContent>
					<ConversationScrollButton />
				</Conversation>
			</div>

			<PromptInput
				onSubmit={(event) => {
					event.preventDefault();
					const text = input.trim();
					if (!text || isBusy) {
						return;
					}

					sendMessage({ text }).catch(() => undefined);
					setInput("");
				}}
			>
				<PromptInputTextarea
					autoComplete="off"
					autoFocus
					disabled={isBusy}
					name="prompt"
					onChange={(event) => setInput(event.target.value)}
					placeholder={`Ask ${persona.name} anything...`}
					value={input}
				/>
				<div className="flex items-center justify-between gap-3">
					<p className="text-muted-foreground text-xs">
						{isBusy
							? "Waiting for a response..."
							: "Press Enter to send, Shift+Enter for a new line."}
					</p>
					<PromptInputSubmit disabled={isBusy} status={status} />
				</div>
			</PromptInput>
		</div>
	);
}
