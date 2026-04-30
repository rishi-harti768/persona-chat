"use client";

import type {
	PersonaDefinition,
	PersonaId,
	PersonaState,
} from "@/lib/personas";
import { Persona } from "./ai-elements/persona";

interface PersonaSwitcherProps {
	onSelect: (personaId: PersonaId) => void;
	personas: readonly PersonaDefinition[];
	selectedPersonaId: PersonaId;
	state: PersonaState;
}

export function PersonaSwitcher({
	personas,
	selectedPersonaId,
	state,
	onSelect,
}: PersonaSwitcherProps) {
	return (
		<div className="grid gap-3 sm:grid-cols-3">
			{personas.map((persona) => {
				const isActive = persona.id === selectedPersonaId;
				return (
					<button
						aria-pressed={isActive}
						className={[
							"rounded-2xl border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
							isActive
								? "border-primary bg-primary/5 shadow-sm"
								: "border-border bg-background hover:bg-muted/40",
						].join(" ")}
						key={persona.id}
						onClick={() => onSelect(persona.id)}
						type="button"
					>
						<Persona
							className="mb-3"
							state={isActive ? state : "idle"}
							variant={persona.variant}
						/>
						<div className="font-medium text-sm">{persona.name}</div>
						<div className="mt-1 text-muted-foreground text-xs">
							{persona.title}
						</div>
					</button>
				);
			})}
		</div>
	);
}
