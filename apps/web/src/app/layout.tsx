import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "../index.css";
import Header from "@/components/header";
import Providers from "@/components/providers";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Persona Chat",
	description:
		"Chat with distinct Scaler-inspired personas in a streaming AI interface.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<a className="sr-only focus:not-sr-only" href="#content">
					Skip to content
				</a>
				<Providers>
					<div className="grid h-svh grid-rows-[auto_1fr] overflow-hidden">
						<Header />
						<main className="min-h-0 overflow-hidden" id="content">
							{children}
						</main>
					</div>
				</Providers>
			</body>
		</html>
	);
}
