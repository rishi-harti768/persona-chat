import type { PersonaId } from "./personas";

export const suggestionsByPersona = {
	anshuman: [
		"How do I stand out in interviews quickly?",
		"What should I build to get hired faster?",
		"How do I stay disciplined while learning?",
	],
	abhimanyu: [
		"Can you explain system design interview structure?",
		"How do I compare SQL and NoSQL for a product?",
		"What is the right way to think about React state?",
	],
	kshitij: [
		"Can you explain arrays like I'm a beginner?",
		"How do I start learning Python from scratch?",
		"What's a simple way to understand loops?",
	],
} as const satisfies Record<PersonaId, readonly string[]>;

export function getSuggestionsForPersona(personaId: PersonaId) {
	return suggestionsByPersona[personaId];
}
