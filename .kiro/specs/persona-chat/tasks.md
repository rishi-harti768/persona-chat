# Implementation Plan: Persona-Based AI Chatbot

## Overview

This implementation plan leverages Vercel's SDK ecosystem to minimize custom code:

- **AI SDK**: LLM integration with streaming (streamText, toUIMessageStreamResponse)
- **Chat SDK**: Chat layer for message handling, thread management, and web platform integration
- **AI Elements**: Pre-built UI components (Conversation, Message, PromptInput, Persona, Suggestion)
- **@persona-chat/env**: Environment variable management (existing)

## Tasks

- [x] 1. Install SDK packages
  - [x] 1.1 Verify AI SDK packages in apps/web
    - Check if `ai`, `@ai-sdk/google` are installed
    - Run: `bun add ai @ai-sdk/google` if needed
    - _Requirements: 2.3, 2.6_
  - [x] 1.2 Install Chat SDK
    - Run: `bun add chat @chat-adapter/web`
    - _Requirements: 3.1_

- [x] 2. Set up environment configuration
  - [x] 2.1 Verify @persona-chat/env package
    - Confirm GOOGLE_GENERATIVE_AI_API_KEY is in packages/env/src/server.ts
    - _Requirements: 8.1, 8.2, 8.4, 8.5_
  - [x] 2.2 Create .env.example file
    - Add GOOGLE_GENERATIVE_AI_API_KEY placeholder
    - _Requirements: 8.3_

- [x] 3. Create persona system prompts (data only, no UI code)
  - [x] 3.1 Create persona constants file
    - Define Persona type and personas array
    - Create apps/web/src/lib/personas.ts
    - _Requirements: 1.1, 1.2, 4.1_
  - [x] 3.2 Implement system prompts for all 3 personas
    - Anshuman Singh: direct, motivational
    - Abhimanyu Saxena: analytical, detailed
    - Kshitij Mishra: friendly, approachable
    - Each with: description, 3+ few-shot examples, CoT, output format, constraints
    - _Requirements: 1.3, 1.4, 1.5, 1.6_

- [x] 4. Create suggestion chips data
  - [x] 4.1 Define suggestions per persona
    - Create apps/web/src/lib/suggestions.ts
    - 3+ suggestions per persona
    - _Requirements: 5.2, 5.3_

- [x] 5. Install AI Elements components
  - [x] 5.1 Install via CLI (run in apps/web)
    - `npx ai-elements@latest add conversation`
    - `npx ai-elements@latest add message`
    - `npx ai-elements@latest add prompt-input`
    - `npx ai-elements@latest add persona`
    - `npx ai-elements@latest add suggestion`
    - _Requirements: 3.1, 3.2, 3.3, 4.2, 5.1, 6.1_

- [x] 6. Create Chat API endpoint (AI SDK pattern)
  - [x] 6.1 Create POST /api/chat route
    - Create apps/web/src/app/api/chat/route.ts
    - Use AI SDK streamText with google model
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 6.2 Add persona system prompt injection
    - Read personaId from request body or headers
    - Inject corresponding system prompt
    - _Requirements: 2.4_
  - [x] 6.3 Use toUIMessageStreamResponse()
    - Return streaming response
    - _Requirements: 2.5_
  - [x] 6.4 Add error handling
    - 400 for invalid request, 500 for LLM errors
    - _Requirements: 2.7, 2.8, 9.1_

- [x] 7. Set up Chat SDK for web platform
  - [x] 7.1 Create Chat SDK instance with web adapter
    - Create apps/web/src/lib/chat-sdk.ts
    - Initialize Chat with createWebAdapter()
    - _Requirements: 3.1_
  - [x] 7.2 Implement thread management
    - Use Thread.post() for sending messages
    - Use Thread.subscribe() for receiving responses
    - _Requirements: 3.1, 10.1_

- [x] 8. Create Chat Interface (using AI Elements + Chat SDK)
  - [x] 8.1 Create ChatInterface component
    - Use Chat SDK for message handling (NOT useChat)
    - Use AI Elements Conversation + Message + PromptInput
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_
  - [x] 8.2 Wire Chat SDK to AI Elements
    - Map Chat SDK messages to Message components
    - Map Chat SDK status to PromptInputSubmit
    - _Requirements: 3.5, 10.1, 10.2_

- [x] 9. Create Persona Switcher (AI Elements Persona)
  - [x] 9.1 Create PersonaSwitcher component
    - Use AI Elements Persona component
    - Display 3 persona options with names
    - _Requirements: 4.1, 4.3, 4.6_
  - [x] 9.2 Map chat status to persona state
    - status="submitted" → state="thinking"
    - status="streaming" → state="speaking"
    - status="ready" → state="idle"
    - _Requirements: 6.2, 6.3, 6.4_
  - [x] 9.3 Handle persona selection
    - On click: clear thread, update system prompt
    - _Requirements: 4.4, 4.5, 10.3_

- [x] 10. Create Suggestion Chips (AI Elements)
  - [x] 10.1 Use AI Elements Suggestions/Suggestion
    - Import from @/components/ai-elements/suggestion
    - _Requirements: 5.1_
  - [x] 10.2 Wire click to Chat SDK thread.post()
    - onClick → thread.post(text)
    - _Requirements: 5.4_
  - [x] 10.3 Hide after first message
    - Show only when messages.length === 0
    - _Requirements: 5.5_

- [x] 11. Typing Indicator (AI Elements Persona states)
  - [x] 11.1 Already covered in Task 9.2
    - Persona component handles typing indicator via states
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 12. Wire main page
  - [x] 12.1 Update apps/web/src/app/page.tsx
    - Combine all components
    - Manage persona state
    - _Requirements: 4.6_
  - [x] 12.2 Mobile responsiveness
    - AI Elements components are responsive by default
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 13. Build verification
  - [x] 13.1 Run build
    - `bun run build` in apps/web
    - Verify no TypeScript errors

- [x] 14. Final verification
  - [x] 14.1 Test persona switching
  - [x] 14.2 Test chat functionality
  - [x] 14.3 Test suggestion chips
  - [x] 14.4 Test typing indicator

## SDK Usage Summary

| Feature         | SDK/Component                    | What It Provides                         |
| --------------- | -------------------------------- | ---------------------------------------- |
| Chat state      | Chat SDK Thread                  | messages, post(), stream(), subscribe()  |
| Message display | AI Elements Message              | User/assistant styling                   |
| Message list    | AI Elements Conversation         | Auto-scroll, scroll button               |
| Text input      | AI Elements PromptInput          | Auto-resizing textarea, submit button    |
| Persona visual  | AI Elements Persona              | Animated states (idle/thinking/speaking) |
| Suggestions     | AI Elements Suggestion           | Clickable chips                          |
| LLM calls       | AI SDK streamText                | Streaming responses                      |
| API endpoint    | AI SDK toUIMessageStreamResponse | Response streaming                       |
