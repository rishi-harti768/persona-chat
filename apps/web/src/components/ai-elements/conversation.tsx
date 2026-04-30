"use client";

import { Button } from "@persona-chat/ui/components/button";
import { cn } from "@persona-chat/ui/lib/utils";
import { ArrowDown } from "lucide-react";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
} from "react";

interface ConversationContextValue {
	scrollToBottom: () => void;
}

const ConversationContext = createContext<ConversationContextValue | null>(
	null
);

export function Conversation({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	const viewportRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = useCallback(() => {
		const viewport = viewportRef.current;
		if (!viewport) {
			return;
		}

		viewport.scrollTo({
			top: viewport.scrollHeight,
			behavior: "smooth",
		});
	}, []);

	return (
		<ConversationContext.Provider value={{ scrollToBottom }}>
			<div className={cn("relative flex min-h-0 flex-1 flex-col", className)}>
				<div
					className="scrollbar-thin min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth"
					ref={viewportRef}
				>
					{children}
				</div>
			</div>
		</ConversationContext.Provider>
	);
}

export function ConversationContent({
	children,
	className,
	messageCount,
}: {
	children: ReactNode;
	className?: string;
	messageCount?: number;
}) {
	const contentRef = useRef<HTMLDivElement>(null);
	const previousMessageCount = useRef(messageCount);

	useEffect(() => {
		if (previousMessageCount.current === messageCount) {
			return;
		}

		previousMessageCount.current = messageCount;

		const viewport = contentRef.current?.parentElement;
		if (!viewport) {
			return;
		}

		viewport.scrollTo({
			top: viewport.scrollHeight,
			behavior: "smooth",
		});
	});

	return (
		<div
			className={cn("flex flex-col gap-4 p-4 sm:p-6", className)}
			ref={contentRef}
		>
			{children}
			<div aria-hidden="true" className="h-px w-full" />
		</div>
	);
}

export function ConversationScrollButton({
	className,
}: {
	className?: string;
}) {
	const context = useContext(ConversationContext);

	if (!context) {
		return null;
	}

	return (
		<Button
			aria-label="Scroll to latest message"
			className={cn(
				"absolute right-4 bottom-4 rounded-full shadow-sm",
				className
			)}
			onClick={context.scrollToBottom}
			size="icon-sm"
			variant="outline"
		>
			<ArrowDown className="size-4" />
		</Button>
	);
}
