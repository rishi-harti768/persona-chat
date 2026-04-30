# FIX.md

Concrete remediation plan for every finding in `REVIEW.md`.

> Format: each item includes the minimum code change that would fix the issue, shown as a diff-style before/after patch.
> These remediations are constrained to the project skills in scope: Ultracite, Turborepo, Next.js best practices, AI SDK, shadcn, Vercel React best practices, web design guidelines, and composition patterns.

---

## 1) Secure and validate the public AI route

### What to change
- Remove `@ai-sdk/devtools` from the production route.
- Keep the Google Gemini provider, but wire it through validated env instead of hardcoding behavior.
- Validate the request body at runtime.
- Add a real abuse-control layer before shipping this publicly (auth, shared key, or rate limiting middleware).

### Patch
```diff
--- a/apps/web/src/app/api/ai/route.ts
+++ b/apps/web/src/app/api/ai/route.ts
@@
-import { devToolsMiddleware } from "@ai-sdk/devtools";
-import { google } from "@ai-sdk/google";
-import {
-	convertToModelMessages,
-	streamText,
-	type UIMessage,
-	wrapLanguageModel,
-} from "ai";
+import { google } from "@ai-sdk/google";
+import { convertToModelMessages, streamText, type UIMessage } from "ai";
+import { z } from "zod";
 
 export const maxDuration = 30;
+
+const requestSchema = z.object({
+	messages: z.array(
+		z.object({
+			role: z.string(),
+			parts: z.array(z.unknown()),
+		}),
+	),
+});
 
 export async function POST(req: Request) {
-	const { messages }: { messages: UIMessage[] } = await req.json();
-
-	const model = wrapLanguageModel({
-		model: google("gemini-2.5-flash"),
-		middleware: devToolsMiddleware(),
-	});
+	const { messages }: { messages: UIMessage[] } = await req.json();
+	const parsed = requestSchema.safeParse({ messages });
+
+	if (!parsed.success) {
+		return Response.json({ error: "Invalid request body" }, { status: 400 });
+	}
+
+	const model = google("gemini-2.5-flash");
 	const result = streamText({
 		model,
-		messages: await convertToModelMessages(messages),
+		messages: await convertToModelMessages(parsed.data.messages),
 	});
 
 	return result.toUIMessageStreamResponse();
 }
 ```
 
 ### Add next
 - Put this route behind auth or a rate limiter before exposing it publicly.
 - Add `GOOGLE_GENERATIVE_AI_API_KEY` to the env contract below so the provider can read it by default.

---

## 2) Fix the PWA manifest start URL

### What to change
- Point `start_url` to a real route.
- Replace the placeholder description.

### Patch
```diff
--- a/apps/web/src/app/manifest.ts
+++ b/apps/web/src/app/manifest.ts
@@
 export default function manifest(): MetadataRoute.Manifest {
 	return {
-		name: "persona-chat",
-		short_name: "persona-chat",
-		description: "my pwa app",
-		start_url: "/new",
+		name: "persona-chat",
+		short_name: "persona-chat",
+		description: "Persona chat starter app",
+		start_url: "/",
 		display: "standalone",
 		background_color: "#ffffff",
 		theme_color: "#000000",
```

---

## 3) Wire the loaded font into Tailwind instead of referencing a missing font

### What to change
- Keep Geist in `layout.tsx`.
- Map `--font-sans` and `--font-mono` to the Geist variables in shared CSS.
- This removes the accidental dependency on a non-imported Inter variable.

### Patch
```diff
--- a/apps/web/src/app/layout.tsx
+++ b/apps/web/src/app/layout.tsx
@@
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
 				<Providers>
-					<div className="grid h-svh grid-rows-[auto_1fr]">
+					<div className="grid min-h-svh grid-rows-[auto_1fr]">
 						<Header />
-						{children}
+						<main id="content">{children}</main>
 					</div>
 				</Providers>
 			</body>
 		</html>
 	);
 }
```

```diff
--- a/packages/ui/src/styles/globals.css
+++ b/packages/ui/src/styles/globals.css
@@
 @theme inline {
-	--font-sans: "Inter Variable", sans-serif;
+	--font-sans: var(--font-geist-sans);
+	--font-mono: var(--font-geist-mono);
 	--color-sidebar-ring: var(--sidebar-ring);
```

---

## 4) Fix Turborepo scripts, outputs, and typecheck coverage

### What to change
- Use `turbo run ...` in root scripts.
- Make `db:migrate` non-persistent.
- Exclude `.next/cache/**` from build outputs.
- Add `check-types` scripts to every package Turbo should cover.

### Patch: root scripts and Turbo config
```diff
--- a/package.json
+++ b/package.json
@@
 	"scripts": {
-		"dev": "turbo dev",
-		"build": "turbo build",
-		"check-types": "turbo check-types",
-		"dev:web": "turbo -F web dev",
-		"db:push": "turbo -F @persona-chat/db db:push",
-		"db:studio": "turbo -F @persona-chat/db db:studio",
-		"db:generate": "turbo -F @persona-chat/db db:generate",
-		"db:migrate": "turbo -F @persona-chat/db db:migrate",
+		"dev": "turbo run dev",
+		"build": "turbo run build",
+		"check-types": "turbo run check-types",
+		"dev:web": "turbo run dev --filter=web",
+		"db:push": "turbo run db:push --filter=@persona-chat/db",
+		"db:studio": "turbo run db:studio --filter=@persona-chat/db",
+		"db:generate": "turbo run db:generate --filter=@persona-chat/db",
+		"db:migrate": "turbo run db:migrate --filter=@persona-chat/db",
```

```diff
--- a/turbo.json
+++ b/turbo.json
@@
 		"build": {
 			"dependsOn": ["^build"],
 			"inputs": ["$TURBO_DEFAULT$", ".env*"]
-			"outputs": ["dist/**", ".next/**"]
+			"outputs": ["dist/**", ".next/**", "!.next/cache/**"]
 		},
@@
 		"db:migrate": {
 			"cache": false,
-			"persistent": true
+			"persistent": false
 		},
```

### Patch: add `check-types` to the packages Turbo should traverse
```diff
--- a/apps/web/package.json
+++ b/apps/web/package.json
@@
 	"scripts": {
 		"dev": "bun --bun next dev",
 		"build": "bun --bun next build",
-		"start": "bun --bun next start"
+		"start": "bun --bun next start",
+		"check-types": "tsc --noEmit"
 	},
```

```diff
--- a/packages/api/package.json
+++ b/packages/api/package.json
@@
-	"scripts": {},
+	"scripts": {
+		"check-types": "tsc --noEmit"
+	},
```

```diff
--- a/packages/db/package.json
+++ b/packages/db/package.json
@@
 	"scripts": {
 		"db:push": "drizzle-kit push",
 		"db:generate": "drizzle-kit generate",
 		"db:studio": "drizzle-kit studio",
-		"db:migrate": "drizzle-kit migrate"
+		"db:migrate": "drizzle-kit migrate",
+		"check-types": "tsc --noEmit"
 	},
```

```diff
--- a/packages/env/package.json
+++ b/packages/env/package.json
@@
 	"private": true,
 	"type": "module",
+	"scripts": {
+		"check-types": "tsc --noEmit"
+	},
 	"exports": {
```

---

## 5) Decouple the DB package from `apps/web/.env`

### What to change
- Load env from the DB package itself.
- Stop reaching into another app’s directory.

### Patch
```diff
--- a/packages/db/drizzle.config.ts
+++ b/packages/db/drizzle.config.ts
@@
-import dotenv from "dotenv";
+import dotenv from "dotenv";
 import { defineConfig } from "drizzle-kit";
+import { fileURLToPath } from "node:url";
 
 dotenv.config({
-	path: "../../apps/web/.env",
+	path: fileURLToPath(new URL("./.env", import.meta.url)),
 });
```

### Add next
- Put the DB env file in `packages/db/.env`.
- Keep app-specific env in the app package; keep DB tooling env in the DB package.

---

## 6) Clean up the AI chat page UI and accessibility

### What to change
- Depend on `messages.length` instead of the full array so the scroll effect stays stable and lint-clean.
- Use `gap-*` instead of `space-*`.
- Give the submit button an accessible name.
- Stop using the bare index as the only key.
- Make the chat region live-updating for screen readers.

### Patch
```diff
--- a/apps/web/src/app/ai/page.tsx
+++ b/apps/web/src/app/ai/page.tsx
@@
 	const messagesEndRef = useRef<HTMLDivElement>(null);
 
 	useEffect(() => {
 		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
-	}, [messages]);
+	}, [messages.length]);
@@
-		<div className="mx-auto grid w-full grid-rows-[1fr_auto] overflow-hidden p-4">
-			<div className="space-y-4 overflow-y-auto pb-4">
+		<div className="mx-auto grid w-full grid-rows-[1fr_auto] overflow-hidden p-4">
+			<div aria-live="polite" className="space-y-4 overflow-y-auto pb-4">
@@
 						<div
 							className={`rounded-lg p-3 ${
 								message.role === "user"
 									? "ml-8 bg-primary/10"
 									: "mr-8 bg-secondary/20"
 								}`}
 							key={message.id}
 						>
@@
 							{message.parts?.map((part, index) => {
 								if (part.type === "text") {
 									return (
 										<Streamdown
 											isAnimating={
 												status === "streaming" && message.role === "assistant"
 											}
-											key={index}
+											key={`${message.id}-${index}`}
 										>
 											{part.text}
 										</Streamdown>
 									);
 								}
@@
 			<form
-				className="flex w-full items-center space-x-2 border-t pt-2"
+				className="flex w-full items-center gap-2 border-t pt-2"
 				onSubmit={handleSubmit}
 			>
@@
-				<Button size="icon" type="submit">
-					<Send size={18} />
+				<Button aria-label="Send message" size="icon" type="submit">
+					<Send className="size-4" aria-hidden="true" />
 				</Button>
 			</form>
 		</div>
 	);
 }
```

---

## 7) Make the theme toggle icon-only button follow shared icon hygiene

### What to change
- Use size tokens instead of hard-coded `h-[1.2rem] w-[1.2rem]`.
- Hide decorative icons from assistive tech.

### Patch
```diff
--- a/apps/web/src/components/mode-toggle.tsx
+++ b/apps/web/src/components/mode-toggle.tsx
@@
 		<DropdownMenu>
 			<DropdownMenuTrigger render={<Button size="icon" variant="outline" />}>
-				<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
-				<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
+				<Sun
+					aria-hidden="true"
+					className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
+				/>
+				<Moon
+					aria-hidden="true"
+					className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
+				/>
 				<span className="sr-only">Toggle theme</span>
 			</DropdownMenuTrigger>
```

---

## 8) Improve header semantics, current-page state, skip link, and main landmark

### What to change
- Use `<header>` instead of a generic wrapper.
- Use the shared `Separator` instead of `<hr />`.
- Add `aria-current="page"` to the active nav link.
- Add a skip link and a real `<main>` in the root layout.

### Patch: header
```diff
--- a/apps/web/src/components/header.tsx
+++ b/apps/web/src/components/header.tsx
@@
 "use client";
 import Link from "next/link";
+import { usePathname } from "next/navigation";
 
 import { ModeToggle } from "./mode-toggle";
+import { Separator } from "@persona-chat/ui/components/separator";
 
 export default function Header() {
+	const pathname = usePathname();
 	const links = [
 		{ to: "/", label: "Home" },
 		{ to: "/ai", label: "AI Chat" },
 	] as const;
 
 	return (
-		<div>
-			<div className="flex flex-row items-center justify-between px-2 py-1">
-				<nav className="flex gap-4 text-lg">
+			<header>
+			<div className="flex flex-row items-center justify-between px-2 py-1">
+				<nav aria-label="Primary" className="flex gap-4 text-lg">
 					{links.map(({ to, label }) => (
-						<Link href={to} key={to}>
+						<Link aria-current={pathname === to ? "page" : undefined} href={to} key={to}>
 							{label}
 						</Link>
 					))}
 				</nav>
 				<div className="flex items-center gap-2">
 					<ModeToggle />
 				</div>
 			</div>
-			<hr />
-		</div>
+			<Separator />
+			</header>
 	);
 }
```

### Patch: root layout
```diff
--- a/apps/web/src/app/layout.tsx
+++ b/apps/web/src/app/layout.tsx
@@
 	return (
 		<html lang="en" suppressHydrationWarning>
 			<body
 				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
 			>
+				<a className="sr-only focus:not-sr-only" href="#content">
+					Skip to content
+				</a>
 				<Providers>
 					<div className="grid min-h-svh grid-rows-[auto_1fr]">
 						<Header />
 						<main id="content">{children}</main>
 					</div>
 				</Providers>
```

---

## 9) Give the landing page a real heading and remove the nested ternary

### What to change
- Add an actual `<h1>`.
- Keep the ASCII art decorative.
- Compute the status text outside JSX.

### Patch
```diff
--- a/apps/web/src/app/page.tsx
+++ b/apps/web/src/app/page.tsx
@@
 export default function Home() {
 	const healthCheck = useQuery(orpc.healthCheck.queryOptions());
+
+	let statusText = "Disconnected";
+	if (healthCheck.isLoading) {
+		statusText = "Checking...";
+	} else if (healthCheck.data) {
+		statusText = "Connected";
+	}
 
 	return (
 		<div className="container mx-auto max-w-3xl px-4 py-2">
-			<pre className="overflow-x-auto font-mono text-sm">{TITLE_TEXT}</pre>
+			<h1 className="sr-only">persona-chat</h1>
+			<pre aria-hidden="true" className="overflow-x-auto font-mono text-sm">
+				{TITLE_TEXT}
+			</pre>
 			<div className="grid gap-6">
@@
 					<div
 						className={`h-2 w-2 rounded-full ${healthCheck.data ? "bg-green-500" : "bg-red-500"}`}
 					/>
 					<span className="text-muted-foreground text-sm">
-						{healthCheck.isLoading
-							? "Checking..."
-							: healthCheck.data
-								? "Connected"
-								: "Disconnected"}
+						{statusText}
 					</span>
 				</div>
 			</section>
```

---

## 10) Replace the label primitive with Radix so it is actually a controlled accessible label

### What to change
- Use the standard Radix label primitive.
- Add the package dependency.

### Patch
```diff
--- a/packages/ui/src/components/label.tsx
+++ b/packages/ui/src/components/label.tsx
@@
+import * as LabelPrimitive from "@radix-ui/react-label";
 import { cn } from "@persona-chat/ui/lib/utils";
 import type * as React from "react";
 
-function Label({ className, ...props }: React.ComponentProps<"label">) {
+function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
 	return (
-		<label
+		<LabelPrimitive.Root
 			className={cn(
 				"flex select-none items-center gap-2 text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
 				className
 			)}
 			data-slot="label"
 			{...props}
 		/>
 	);
 }
```

```diff
--- a/packages/ui/package.json
+++ b/packages/ui/package.json
@@
 	"dependencies": {
 		"@base-ui/react": "^1.0.0",
+		"@radix-ui/react-label": "^2.1.8",
 		"class-variance-authority": "^0.7.1",
```

---

## 11) Keep React Query DevTools out of production bundles

### What to change
- Load devtools only in development.
- Use dynamic import so production does not ship the tool.

### Patch
```diff
--- a/apps/web/src/components/providers.tsx
+++ b/apps/web/src/components/providers.tsx
@@
 "use client";
 
+import dynamic from "next/dynamic";
 import { Toaster } from "@persona-chat/ui/components/sonner";
 import { QueryClientProvider } from "@tanstack/react-query";
-import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
 
 import { queryClient } from "@/utils/orpc";
 
 import { ThemeProvider } from "./theme-provider";
+
+const ReactQueryDevtools = dynamic(
+	() => import("@tanstack/react-query-devtools").then((mod) => mod.ReactQueryDevtools),
+	{ ssr: false },
+);
 
 export default function Providers({ children }: { children: React.ReactNode }) {
+	const isDevelopment = process.env.NODE_ENV === "development";
+
 	return (
@@
 			<QueryClientProvider client={queryClient}>
 				{children}
-				<ReactQueryDevtools />
+				{isDevelopment ? <ReactQueryDevtools initialIsOpen={false} /> : null}
 			</QueryClientProvider>
```

---

## 12) Use a relative ORPC URL instead of hardcoding localhost

### What to change
- Stop branching on `window.location.origin` and localhost.
- Use the same origin with a relative route.

### Patch
```diff
--- a/apps/web/src/utils/orpc.ts
+++ b/apps/web/src/utils/orpc.ts
@@
 export const link = new RPCLink({
-	url: `${typeof window === "undefined" ? "http://localhost:3001" : window.location.origin}/api/rpc`,
+	url: "/api/rpc",
 });
```

---

## 13) Reuse the RPC context instead of creating it twice

### What to change
- Create the request context once per request.
- Reuse it for both RPC and OpenAPI handlers.

### Patch
```diff
--- a/apps/web/src/app/api/rpc/[[...rest]]/route.ts
+++ b/apps/web/src/app/api/rpc/[[...rest]]/route.ts
@@
 async function handleRequest(req: NextRequest) {
+	const context = await createContext(req);
+
 	const rpcResult = await rpcHandler.handle(req, {
 		prefix: "/api/rpc",
-		context: await createContext(req),
+		context,
 	});
 	if (rpcResult.response) {
 		return rpcResult.response;
 	}
 
 	const apiResult = await apiHandler.handle(req, {
 		prefix: "/api/rpc/api-reference",
-		context: await createContext(req),
+		context,
 	});
```

---

## 14) Make API context synchronous until it actually needs async request work

### What to change
- Remove the fake `async`.
- Remove the unused request parameter.
- Keep the function honest until auth/session work exists.

### Patch
```diff
--- a/packages/api/src/context.ts
+++ b/packages/api/src/context.ts
@@
 import type { NextRequest } from "next/server";
 
-export async function createContext(_req: NextRequest) {
+
+export function createContext(_req: NextRequest) {
 	return {
 		auth: null,
 		session: null,
 	};
 }
 
-export type Context = Awaited<ReturnType<typeof createContext>>;
+export type Context = ReturnType<typeof createContext>;
```

---

## 15) Stop leaving the DB layer as an empty shell

### What to change
- Add at least one real table.
- Re-export it from the DB package so consumers can import actual schema.

### Patch
```diff
--- a/packages/db/src/schema/index.ts
+++ b/packages/db/src/schema/index.ts
@@
-export {};
+import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
+
+export const conversations = pgTable("conversations", {
+	id: uuid("id").defaultRandom().primaryKey(),
+	title: text("title").notNull(),
+	createdAt: timestamp("created_at", { withTimezone: true })
+		.defaultNow()
+		.notNull(),
+	updatedAt: timestamp("updated_at", { withTimezone: true })
+		.defaultNow()
+		.notNull(),
+});
```

```diff
--- a/packages/db/src/index.ts
+++ b/packages/db/src/index.ts
@@
 import { env } from "@persona-chat/env/server";
 import { drizzle } from "drizzle-orm/node-postgres";
 
 import * as schema from "./schema";
+
+export { schema };
 
 export function createDb() {
 	return drizzle(env.DATABASE_URL, { schema });
 }
```

---

## 16) Bring the README back in sync with the actual repo

### What to change
- Point DB setup to the DB package env file.
- Remove the non-existent PWA asset script.
- Fix the typecheck description so it matches the monorepo scripts.

### Patch
```diff
--- a/README.md
+++ b/README.md
@@
 1. Make sure you have a PostgreSQL database set up.
-2. Update your `apps/web/.env` file with your PostgreSQL connection details.
+2. Update your `packages/db/.env` file with your PostgreSQL connection details.
@@
-- `bun run check-types`: Check TypeScript types across all apps
+- `bun run check-types`: Check TypeScript types across all workspace packages that expose that script
@@
-- `cd apps/web && bun run generate-pwa-assets`: Generate PWA assets
```

---

## 17) Validate the AI env contract and remove dead `CORS_ORIGIN`

### What to change
- Add the Google AI Studio key to the validated server env contract.
- Remove `CORS_ORIGIN` unless you wire it into middleware or request filtering.

### Patch
```diff
--- a/packages/env/src/server.ts
+++ b/packages/env/src/server.ts
@@
 export const env = createEnv({
 	server: {
 		DATABASE_URL: z.string().min(1),
-		CORS_ORIGIN: z.url(),
 		GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1),
 		NODE_ENV: z
 			.enum(["development", "production", "test"])
 			.default("development"),
 	},
 	runtimeEnv: process.env,
 	emptyStringAsUndefined: true,
 });
 ```
 
 ### Add next
 - If you use Gemini locally, document `GOOGLE_GENERATIVE_AI_API_KEY` in your `.env` example.
 - If `CORS_ORIGIN` is needed later, consume it in middleware instead of leaving it as dead config.

---

## Priority order
1. Secure and validate the AI route
2. Fix Turborepo scripts/config and typecheck coverage
3. Fix font + manifest setup
4. Clean up accessibility/shadcn issues in the AI page, header, toggle, and landing page
5. Move DB config/env ownership into the DB package and add a real schema
6. Sync docs with the codebase

