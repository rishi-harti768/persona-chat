"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Square } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Streamdown } from "streamdown";
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
		case "ready":
			return "listening";
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

function getStatusLabel(status: PromptInputStatus) {
	switch (status) {
		case "ready":
			return "Ready";
		case "submitted":
			return "Sending";
		case "streaming":
			return "Responding";
		default:
			return "Error";
	}
}

function getStatusBadgeClasses(status: PromptInputStatus) {
	switch (status) {
		case "ready":
			return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600";
		case "submitted":
			return "border-amber-500/20 bg-amber-500/10 text-amber-600";
		case "streaming":
			return "border-blue-500/20 bg-blue-500/10 text-blue-600";
		default:
			return "border-destructive/20 bg-destructive/10 text-destructive";
	}
}

function getStatusDotClasses(status: PromptInputStatus) {
	switch (status) {
		case "ready":
			return "bg-emerald-500";
		case "submitted":
			return "bg-amber-500";
		case "streaming":
			return "bg-blue-500";
		default:
			return "bg-destructive";
	}
}

function StatusBadge({ status }: { status: PromptInputStatus }) {
	return (
		<span
			className={`hidden items-center gap-2 rounded-full border px-3 py-1 text-sm sm:inline-flex ${getStatusBadgeClasses(status)}`}
		>
			<span className={`size-2 rounded-full ${getStatusDotClasses(status)}`} />
			{getStatusLabel(status)}
		</span>
	);
}

function ChatMessage({
	message,
	isStreaming,
}: {
	message: UIMessage;
	isStreaming: boolean;
}) {
	return (
		<Message from={message.role === "user" ? "user" : "assistant"}>
			<MessageContent>
				{message.parts.map((part, index) => {
					if (part.type !== "text") {
						return null;
					}

					return (
						<MessageResponse key={`${message.id}-${index}`}>
							{message.role === "assistant" ? (
								<Streamdown
									isAnimating={isStreaming}
									mode={isStreaming ? "streaming" : "static"}
								>
									{part.text}
								</Streamdown>
							) : (
								part.text
							)}
						</MessageResponse>
					);
				})}
			</MessageContent>
		</Message>
	);
}

function ChatMessages({
	messages,
	isStreaming,
	isBusy,
	errorMessage,
	suggestions,
	onSuggestionClick,
}: {
	messages: ReturnType<typeof useChat>["messages"];
	isStreaming: boolean;
	isBusy: boolean;
	errorMessage: string | null;
	suggestions: readonly string[];
	onSuggestionClick: (text: string) => void;
}) {
	const hasMessages = messages.length > 0;

	return (
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
						Start with one of the suggestions below or ask your own question.
					</div>
				)}

				{messages.map((message) => (
					<ChatMessage
						isStreaming={isStreaming}
						key={message.id}
						message={message}
					/>
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

										onSuggestionClick(text);
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
	);
}

function ChatComposer({
	isBusy,
	input,
	personaName,
	onChange,
	onSubmit,
}: {
	isBusy: boolean;
	input: string;
	personaName: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
}) {
	return (
		<PromptInput
			onSubmit={(event) => {
				event.preventDefault();
				onSubmit();
			}}
		>
			<PromptInputTextarea
				autoComplete="off"
				autoFocus
				disabled={isBusy}
				name="prompt"
				onChange={(event) => onChange(event.target.value)}
				onKeyDown={(event) => {
					if (
						event.key !== "Enter" ||
						event.shiftKey ||
						event.nativeEvent.isComposing
					) {
						return;
					}

					event.preventDefault();
					event.currentTarget.form?.requestSubmit();
				}}
				placeholder={`Ask ${personaName} anything...`}
				value={input}
			/>
			<div className="flex items-center justify-between gap-3">
				<p className="text-muted-foreground text-xs">
					{isBusy
						? "Waiting for a response..."
						: "Press Enter to send, Shift+Enter for a new line."}
				</p>
				<PromptInputSubmit
					disabled={isBusy}
					status={isBusy ? "submitted" : "ready"}
				/>
			</div>
		</PromptInput>
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

	useEffect(() => {
		onStatusChange(getPersonaState(status));
	}, [onStatusChange, status]);

	const suggestions = getSuggestionsForPersona(persona.id);
	const errorMessage = getErrorMessage(error);
	const isBusy = status === "submitted" || status === "streaming";
	const isStreaming = status === "streaming";

	return (
		<div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border bg-card shadow-sm">
			<div className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-6">
				<div>
					<div className="font-semibold text-base">{persona.name}</div>
					<div className="text-muted-foreground text-sm">
						{persona.description}
					</div>
				</div>
				<div className="flex items-center gap-2">
					<StatusBadge status={status} />
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
				<ChatMessages
					errorMessage={errorMessage}
					isBusy={isBusy}
					isStreaming={isStreaming}
					messages={messages}
					onSuggestionClick={(text) => {
						sendMessage({ text }).catch(() => undefined);
						setInput("");
					}}
					suggestions={suggestions}
				/>
			</div>

			<ChatComposer
				input={input}
				isBusy={isBusy}
				onChange={setInput}
				onSubmit={() => {
					const text = input.trim();
					if (!text || isBusy) {
						return;
					}

					sendMessage({ text }).catch(() => undefined);
					setInput("");
				}}
				personaName={persona.name}
			/>
		</div>
	);
}
