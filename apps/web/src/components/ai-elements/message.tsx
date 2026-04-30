"use client";

import { cn } from "@persona-chat/ui/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

export function Message({
	from,
	children,
	className,
	...props
}: HTMLAttributes<HTMLDivElement> & {
	from: "user" | "assistant";
	children: ReactNode;
}) {
	return (
		<div
			className={cn(
				"group rounded-2xl border px-4 py-3 shadow-sm",
				from === "user"
					? "ml-auto max-w-[85%] border-primary/20 bg-primary/5"
					: "mr-auto max-w-[85%] border-border bg-card",
				className
			)}
			data-from={from}
			{...props}
		>
			{children}
		</div>
	);
}

export function MessageContent({
	children,
	className,
	...props
}: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn("flex flex-col gap-2 text-sm leading-6", className)}
			{...props}
		>
			{children}
		</div>
	);
}

export function MessageResponse({
	children,
	className,
	...props
}: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn("whitespace-pre-wrap text-foreground", className)}
			{...props}
		>
			{children}
		</div>
	);
}
