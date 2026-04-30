"use client";

import { Button } from "@persona-chat/ui/components/button";
import { cn } from "@persona-chat/ui/lib/utils";
import { Send, Square } from "lucide-react";
import {
	type ComponentProps,
	type FormEvent,
	forwardRef,
	type HTMLAttributes,
	type TextareaHTMLAttributes,
	useEffect,
	useImperativeHandle,
	useRef,
} from "react";

export type PromptInputStatus = "ready" | "submitted" | "streaming" | "error";

export function PromptInput({
	children,
	onSubmit,
	className,
	...props
}: HTMLAttributes<HTMLFormElement> & {
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
	return (
		<form
			className={cn(
				"flex flex-col gap-3 border-t bg-background p-4 sm:p-6",
				className
			)}
			onSubmit={onSubmit}
			{...props}
		>
			{children}
		</form>
	);
}

export const PromptInputTextarea = forwardRef<
	HTMLTextAreaElement,
	TextareaHTMLAttributes<HTMLTextAreaElement>
>(function PromptInputTextarea(
	{ className, onChange, value, ...props },
	forwardedRef
) {
	const localRef = useRef<HTMLTextAreaElement | null>(null);

	useImperativeHandle(
		forwardedRef,
		() => localRef.current as HTMLTextAreaElement
	);

	useEffect(() => {
		const element = localRef.current;
		if (!element) {
			return;
		}

		element.style.height = "auto";
		element.style.height = `${Math.min(element.scrollHeight, 180)}px`;
	});

	return (
		<textarea
			className={cn(
				"min-h-12 w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60",
				className
			)}
			onChange={onChange}
			ref={localRef}
			rows={1}
			value={value}
			{...props}
		/>
	);
});

export function PromptInputSubmit({
	status,
	className,
	disabled,
	...props
}: ComponentProps<typeof Button> & { status: PromptInputStatus }) {
	const isBusy = status === "submitted" || status === "streaming";

	return (
		<Button
			aria-label={isBusy ? "Thinking" : "Send message"}
			className={cn("self-end", className)}
			disabled={isBusy || disabled}
			size="sm"
			type="submit"
			variant={isBusy ? "secondary" : "default"}
			{...props}
		>
			{isBusy ? <Square className="size-3.5" /> : <Send className="size-3.5" />}
			<span>{isBusy ? "Thinking" : "Send"}</span>
		</Button>
	);
}
