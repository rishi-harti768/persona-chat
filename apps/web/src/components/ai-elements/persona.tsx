"use client";

import { cn } from "@persona-chat/ui/lib/utils";

import type { PersonaState } from "@/lib/personas";

const stateLabels: Record<PersonaState, string> = {
	idle: "Idle",
	listening: "Listening",
	thinking: "Thinking",
	speaking: "Speaking",
};

const stateClasses: Record<PersonaState, string> = {
	idle: "bg-muted text-muted-foreground",
	listening: "bg-blue-500/15 text-blue-600",
	thinking: "bg-amber-500/15 text-amber-600 animate-pulse",
	speaking: "bg-emerald-500/15 text-emerald-600",
};

const variantClasses = {
	obsidian: "from-slate-700 to-slate-900",
	mana: "from-violet-500 to-fuchsia-600",
	opal: "from-cyan-500 to-sky-600",
	halo: "from-amber-400 to-orange-500",
	glint: "from-pink-500 to-rose-600",
	command: "from-zinc-800 to-zinc-950",
} as const;

export function Persona({
	state,
	variant,
	className,
}: {
	state: PersonaState;
	variant: keyof typeof variantClasses;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex items-center gap-3 rounded-2xl border bg-card p-3",
				className
			)}
		>
			<div
				className={cn(
					"flex size-12 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-inner",
					variantClasses[variant],
					state === "speaking" && "scale-105",
					state === "thinking" && "animate-pulse"
				)}
			>
				<div className="size-4 rounded-full bg-white/90" />
			</div>
			<div className="min-w-0">
				<div className="font-medium text-foreground text-sm">
					{stateLabels[state]}
				</div>
				<div className={cn("text-xs", stateClasses[state])}>
					{stateLabels[state]}
				</div>
			</div>
		</div>
	);
}
