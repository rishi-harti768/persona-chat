"use client";

import { useMemo, useState } from "react";
import {
	getPersonaById,
	type PersonaId,
	type PersonaState,
	personas,
} from "@/lib/personas";
import { ChatInterface } from "./chat-interface";
import { PersonaSwitcher } from "./persona-switcher";

const defaultPersonaId: PersonaId = "anshuman";

export function PersonaChatApp() {
	const [selectedPersonaId, setSelectedPersonaId] =
		useState<PersonaId>(defaultPersonaId);
	const [status, setStatus] = useState<PersonaState>("listening");
	const persona = useMemo(
		() => getPersonaById(selectedPersonaId),
		[selectedPersonaId]
	);

	return (
		<div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
			<section className="space-y-2">
				<h1 className="font-semibold text-3xl tracking-tight sm:text-4xl">
					Persona Chat
				</h1>
				<p className="max-w-3xl text-muted-foreground">
					Switch between distinct Scaler-inspired personas, each with its own
					prompt, suggestions, and conversational style.
				</p>
			</section>

			<PersonaSwitcher
				onSelect={(personaId) => {
					setStatus("listening");
					setSelectedPersonaId(personaId);
				}}
				personas={personas}
				selectedPersonaId={selectedPersonaId}
				state={status}
			/>

			<div className="min-h-0 flex-1">
				<ChatInterface
					key={persona.id}
					onStatusChange={setStatus}
					persona={persona}
				/>
			</div>
		</div>
	);
}
