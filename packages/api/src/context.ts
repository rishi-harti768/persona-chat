export function createContext() {
	return {
		auth: null,
		session: null,
	};
}

export type Context = ReturnType<typeof createContext>;
