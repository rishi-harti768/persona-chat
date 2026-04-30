"use client";

import { Toaster } from "@persona-chat/ui/components/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";

import { queryClient } from "@/utils/orpc";

import { ThemeProvider } from "./theme-provider";

const ReactQueryDevtools = dynamic(
	() =>
		import("@tanstack/react-query-devtools").then(
			(mod) => mod.ReactQueryDevtools
		),
	{ ssr: false }
);

export default function Providers({ children }: { children: React.ReactNode }) {
	const isDevelopment = process.env.NODE_ENV === "development";

	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			disableTransitionOnChange
			enableSystem
		>
			<QueryClientProvider client={queryClient}>
				{children}
				{isDevelopment ? <ReactQueryDevtools initialIsOpen={false} /> : null}
			</QueryClientProvider>
			<Toaster richColors />
		</ThemeProvider>
	);
}
