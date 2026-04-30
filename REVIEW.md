# Ruthless Codebase Audit

Scope: reviewed the current repo against the agent skills available in this project (`ultracite`, `next-best-practices`, `turborepo`, `ai-sdk`, `shadcn`, `vercel-react-best-practices`, `web-design-guidelines`, `next-cache-components`, `vercel-composition-patterns`, plus non-code workflow skills where applicable).

## Executive summary
This starter is close, but it is **not production-ready**. The biggest gaps are:
- the AI route is open-ended and under-validated
- Turborepo scripts are misconfigured and incomplete
- the UI has several accessibility and shadcn violations
- the Next/font setup is inconsistent and likely loading the wrong font
- the PWA manifest points to a route that does not exist
- typechecking coverage is missing for most packages

## Blockers / high-risk issues

### 1) Public AI route ships dev-only tooling, no validation, no abuse protection
- `apps/web/src/app/api/ai/route.ts:1-24`
- Uses `devToolsMiddleware()` in the live route. That is development tooling; it should not ship in production.
- The request body is only type-cast (`{ messages }: { messages: UIMessage[] }`) with no runtime validation. A malformed payload can blow up the route.
- The endpoint is fully public and has no auth/rate limiting. As-is, anyone can burn model quota.
- The route also bypasses the repo skill guidance to prefer the AI Gateway unless there is a reason not to.

### 2) PWA manifest points to a non-existent start URL
- `apps/web/src/app/manifest.ts:5-9`
- `start_url` is `/new`, but the app only defines `/` and `/ai`.
- This means installed PWAs will open to a 404 instead of the app.
- The manifest description is also placeholder quality (`"my pwa app"`).

### 3) Font setup is inconsistent and likely wrong
- `apps/web/src/app/layout.tsx:8-16, 29-37`
- `packages/ui/src/styles/globals.css:39-47`
- The layout loads Geist via `next/font/google`, but Tailwind’s `--font-sans` is set to `"Inter Variable"`, which is not imported anywhere.
- Result: the imported Geist variables are effectively not wired into the theme, and the app may be rendering with an unintended fallback font.
- Fix by mapping `--font-sans` to the Geist variable, or import the font you actually use.

### 4) Turborepo scripts violate repo policy and leave gaps
- `package.json:29-39`
- Root scripts use shorthand `turbo dev` / `turbo build` / `turbo check-types` instead of `turbo run ...`.
- The repo’s own Turborepo skill explicitly says not to write shorthand into package.json.
- `dev:web` and the db scripts also use shorthand filter syntax in scripts.
- `turbo.json:5-9`
  - build outputs should exclude `.next/cache/**`; current config caches the whole `.next/**` tree.
- `turbo.json:26-29`
  - `db:migrate` is marked `persistent: true`, which is wrong for a one-shot migration command.
- `check-types` only exists in `packages/ui/package.json`; the root `check-types` task does **not** cover `web`, `api`, `db`, or `env`.

### 5) The db package is coupled to the web app’s env file
- `packages/db/drizzle.config.ts:1-14`
- It reads `../../apps/web/.env` directly.
- That breaks package isolation and makes the DB package depend on an app-specific path.
- If the web app moves, the DB tooling breaks. This should live in package-owned config or a repo-root env strategy.

## UI / shadcn / accessibility issues

### 6) AI chat input has several UI violations
- `apps/web/src/app/ai/page.tsx:21-23, 76-91`
- Hook dependency warning: `messages` is in the effect deps but not actually used inside the effect body.
- The form uses `space-x-2`; the shadcn skill prefers `gap-*` over `space-*`.
- The submit button is icon-only and has no accessible name (`aria-label`).
- The `Send` icon is manually sized instead of following the component/icon conventions.
- The message list uses `key={index}` for message parts; stable IDs would be better if part identity matters.

### 7) Mode toggle violates icon hygiene and semantic styling guidance
- `apps/web/src/components/mode-toggle.tsx:17-22`
- Sun/Moon icons have explicit sizing classes instead of using the shared button/icon conventions.
- Decorative icons should be hidden from assistive tech if they don’t carry meaning.
- This is minor visually, but it adds up and diverges from the repo’s shadcn rules.

### 8) Header is semantically thin
- `apps/web/src/components/header.tsx:12-27`
- Uses a raw `<hr />` instead of the shared `Separator` component.
- No current-page state on nav links.
- The layout has no skip link and no real `<main>` landmark around page content.

### 9) Home page lacks a real page heading and uses a nested ternary
- `apps/web/src/app/page.tsx:25-40`
- The ASCII art `<pre>` is not a proper accessible heading.
- There is no `<h1>` on the landing page.
- The health status label uses a nested ternary, which the repo’s lint rules already flag.

### 10) `Label` component is still an accessibility smell
- `packages/ui/src/components/label.tsx:4-13`
- Biome flags `noLabelWithoutControl` here.
- If this is meant as a primitive, fine — but then the API/usage needs to consistently wire labels to inputs. Right now the repo has no evidence that this component is being treated as a controlled accessible primitive.

## Next.js / React / performance issues

### 11) React Query DevTools are bundled unconditionally
- `apps/web/src/components/providers.tsx:3-23`
- `ReactQueryDevtools` is rendered in the app provider tree all the time.
- That is dev-only tooling leaking into production bundles.
- Make it development-only or lazy-load it behind a flag.

### 12) ORPC client URL is hardcoded and SSR-fragile
- `apps/web/src/utils/orpc.ts:21-23`
- The client uses `http://localhost:3001` on the server and `window.location.origin` in the browser.
- This is brittle in any non-local environment and can create wrong-origin calls during SSR/hydration.
- Prefer a relative `/api/rpc` URL unless you have a strong reason not to.

### 13) RPC route recreates context twice per request
- `apps/web/src/app/api/rpc/[[...rest]]/route.ts:30-47`
- `createContext(req)` is awaited once for the RPC handler and again for the OpenAPI handler.
- Today it’s a no-op, but once auth/session logic exists this becomes wasted work and a source of inconsistent request state.
- Compute context once and reuse it.

### 14) API context is stubbed and misleading
- `packages/api/src/context.ts:3-10`
- `createContext` is `async` without an `await`, and the `req` parameter is unused.
- This is either incomplete auth plumbing or dead ceremony.
- If context is synchronous, remove `async`; if it will be async later, implement the actual request-derived state now.

### 15) DB layer is basically empty
- `packages/db/src/index.ts:1-10`
- `packages/db/src/schema/index.ts` exports nothing.
- The DB package exists, but there is no actual schema yet, so the “database” layer is a shell.
- That’s fine for a scaffold, but it is not an implemented persistence layer.

## Ultracite / code quality findings
These are the concrete lint errors currently present:
- `apps/web/src/app/ai/page.tsx:21-23` — unnecessary hook dependency
- `apps/web/src/app/page.tsx:36-40` — nested ternary
- `packages/api/src/context.ts:3-8` — async function without await + unused parameter
- `packages/db/src/index.ts:4` — namespace import
- `packages/ui/src/components/label.tsx:6-13` — label without control
- plus formatting noise that should be fixed by `bun x ultracite fix`

## Docs / repo hygiene issues

### 16) README is out of sync with reality
- `README.md:89-100`
- It claims there is a `generate-pwa-assets` script, but none exists in the packages.
- It also says `check-types` covers all apps, but only `packages/ui` actually defines that script.
- The docs are presenting a more complete system than the code actually provides.

### 17) Env schema is incomplete for the AI feature
- `packages/env/src/server.ts:5-15`
- The server env schema validates `DATABASE_URL` and `CORS_ORIGIN`, but the AI route needs a provider key and nothing in the repo validates it.
- If the AI feature is meant to ship, the provider secret should be part of the validated env contract.
- `CORS_ORIGIN` is also currently dead config — validated, but not consumed anywhere.

## Skills with no material findings
- `next-cache-components`: not enabled in `next.config.ts`, so there’s nothing to audit there yet.
- `vercel-composition-patterns`: no severe boolean-prop API smell beyond the icon/button composition notes above.
- `qa`, `browse`, `retro`, `ship`, `plan-*`, `find-skills`: these are workflow skills, not code surfaces; nothing in the repo meaningfully exercises them.

## Bottom line
This repo is a solid scaffold, but the current implementation is still a starter kit, not a polished app. The highest-priority fixes are:
1. secure and validate the AI route
2. fix Turborepo scripts/config
3. fix the font + PWA setup
4. clean up the UI accessibility/shadcn violations
5. add real typecheck coverage beyond `packages/ui`
