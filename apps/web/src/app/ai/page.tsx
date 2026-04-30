"use client";

import { useChat } from "@ai-sdk/react";
import { Button } from "@persona-chat/ui/components/button";
import { Input } from "@persona-chat/ui/components/input";
import { DefaultChatTransport } from "ai";
import { Send } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { Streamdown } from "streamdown";

export default function AIPage() {
	const [input, setInput] = useState("");
	const { messages, sendMessage, status } = useChat({
		transport: new DefaultChatTransport({
			api: "/api/ai",
		}),
	});

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const messageCount = messages.length;

	useEffect(() => {
		if (messageCount > 0) {
			messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
		}
	}, [messageCount]);

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const text = input.trim();
		if (!text) {
			return;
		}
		sendMessage({ text });
		setInput("");
	};

	return (
		<div className="mx-auto grid w-full grid-rows-[1fr_auto] overflow-hidden p-4">
			<div aria-live="polite" className="space-y-4 overflow-y-auto pb-4">
				{messages.length === 0 ? (
					<div className="mt-8 text-center text-muted-foreground">
						Ask me anything to get started!
					</div>
				) : (
					messages.map((message) => (
						<div
							className={`rounded-lg p-3 ${
								message.role === "user"
									? "ml-8 bg-primary/10"
									: "mr-8 bg-secondary/20"
							}`}
							key={message.id}
						>
							<p className="mb-1 font-semibold text-sm">
								{message.role === "user" ? "You" : "AI Assistant"}
							</p>
							{message.parts?.map((part, index) => {
								if (part.type === "text") {
									return (
										<Streamdown
											isAnimating={
												status === "streaming" && message.role === "assistant"
											}
											key={`${message.id}-${index}`}
										>
											{part.text}
										</Streamdown>
									);
								}
								return null;
							})}
						</div>
					))
				)}
				<div ref={messagesEndRef} />
			</div>

			<form
				className="flex w-full items-center gap-2 border-t pt-2"
				onSubmit={handleSubmit}
			>
				<Input
					autoComplete="off"
					autoFocus
					className="flex-1"
					name="prompt"
					onChange={(e) => setInput(e.target.value)}
					placeholder="Type your message..."
					value={input}
				/>
				<Button aria-label="Send message" size="icon" type="submit">
					<Send aria-hidden="true" className="size-4" />
				</Button>
			</form>
		</div>
	);
}
