"use client";

import { cn } from "@persona-chat/ui/lib/utils";
import type { ReactNode } from "react";

export function Suggestions({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("flex flex-wrap gap-2", className)}>{children}</div>
	);
}

export function Suggestion({
	suggestion,
	onClick,
	className,
}: {
	suggestion: string;
	onClick: (text: string) => void;
	className?: string;
}) {
	return (
		<button
			className={cn(
				"rounded-full border border-border bg-background px-3 py-2 text-left text-foreground text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
				className
			)}
			onClick={() => onClick(suggestion)}
			type="button"
		>
			{suggestion}
		</button>
	);
}
