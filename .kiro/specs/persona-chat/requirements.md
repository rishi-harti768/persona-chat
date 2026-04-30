# Requirements Document

## Introduction

This document defines the requirements for the Persona-Based AI Chatbot project. The application enables users to have conversations with three distinct personas modeled after Scaler/InterviewBit personalities: Anshuman Singh, Abhimanyu Saxena, and Kshitij Mishra. Each persona has a unique system prompt that defines their communication style, expertise, and behavior.

## Technology Stack (Vercel SDKs)

This project uses three Vercel SDKs:

1. **AI SDK** (`ai` + `@ai-sdk/google`): The AI layer for LLM integration with streaming (streamText, toUIMessageStreamResponse)
2. **Chat SDK** (`chat` npm package): The chat layer for message handling, thread management, and platform integration
3. **AI Elements** (`ai-elements` npm package): Pre-built UI components for chat interfaces

## Glossary

- **System**: The Persona-Based AI Chatbot application (both frontend and backend)
- **Persona**: A distinct AI character with a unique system prompt defining their personality, communication style, and expertise
- **System Prompt**: A set of instructions passed to the LLM that defines the persona's behavior
- **Chat Message**: A single message in the conversation (Chat SDK Message format)
- **Thread**: Chat SDK's conversation context with post(), stream(), subscribe() methods
- **Conversation**: A sequence of messages exchanged between the user and the persona (Chat SDK Thread)
- **Suggestion Chip**: A quick-start question (AI Elements Suggestion component)
- **Typing Indicator**: Visual feedback (AI Elements Persona component with states)
- **API Route**: Next.js API endpoint using AI SDK streamText
- **Environment Variable**: Configuration value stored outside source code
- **AI Elements**: Vercel component library for AI chat UI
- **AI SDK**: Vercel AI SDK for LLM integration with streaming
- **Chat SDK**: Vercel Chat SDK for chat/message handling across platforms

## Requirements

### Requirement 1: Persona System Prompts

**User Story:** As a developer, I want to create distinct system prompts for each persona, so that the LLM responds in a manner authentic to each person's personality and communication style.

#### Acceptance Criteria

1. THE System SHALL maintain three separate system prompts, one for each persona (Anshuman Singh, Abhimanyu Saxena, Kshitij Mishra).
2. WHEN a persona is selected, THE System SHALL use that persona's system prompt for all subsequent LLM calls in the conversation.
3. FOR EACH persona, THE System Prompt SHALL include:
   - A persona description with background, values, and communication style
   - A minimum of 3 few-shot examples with user questions and ideal persona-style answers
   - A Chain-of-Thought instruction directing the model to reason step-by-step
   - An output format specification (e.g., response length, ending with a question)
   - Constraints defining what the persona should never do
4. THE System Prompt for Anshuman Singh SHALL reflect his role as a tech entrepreneur and educator with a direct, motivational communication style.
5. THE System Prompt for Abhimanyu Saxena SHALL reflect his role as a senior educator with an analytical, detailed explanation style.
6. THE System Prompt for Kshitij Mishra SHALL reflect his role as an instructor with a friendly, approachable communication style.

### Requirement 2: LLM API Integration

**User Story:** As a user, I want to send messages to the chatbot and receive responses from the selected persona, so that I can have authentic conversations with each persona.

#### Acceptance Criteria

1. THE API SHALL expose a POST endpoint at `/api/chat` to handle chat message requests.
2. WHEN a chat request is received, THE API SHALL accept a JSON body containing:
   - `messages`: An array of message objects following the AI SDK UIMessage format (required)
3. THE API SHALL use the AI SDK's `streamText` function with `@ai-sdk/google` provider for LLM calls.
4. THE API SHALL dynamically inject the persona-specific system prompt based on the currently selected persona.
5. THE API SHALL return streamed responses using `toUIMessageStreamResponse()` for real-time streaming.
6. THE API SHALL use the `GOOGLE_GENERATIVE_AI_API_KEY` environment variable from `@persona-chat/env` package and SHALL NOT hardcode the key in source code.
7. IF the LLM call fails, THE API SHALL return a 500 status code with a user-friendly message "Sorry, I'm having trouble responding right now. Please try again."
8. IF the request body is invalid, THE API SHALL return a 400 status code with a descriptive error message.

### Requirement 3: Chat Interface

**User Story:** As a user, I want to see my conversation with the persona in a chat interface, so that I can have a natural conversational experience.

#### Acceptance Criteria

1. THE Chat Interface SHALL use Chat SDK for message handling and thread management.
2. THE Chat Interface SHALL use AI Elements `Conversation` component for displaying messages with automatic scrolling.
3. THE Chat Interface SHALL use AI Elements `Message` component with `from` prop to distinguish user vs assistant messages.
4. THE Chat Interface SHALL use AI Elements `PromptInput` component for message input with auto-resizing textarea.
5. THE Chat Interface SHALL use AI Elements `PromptInputSubmit` with status prop for submit button with streaming state.
6. THE Chat Interface SHALL auto-scroll to the latest message when a new message is added (handled by Conversation component).
7. THE Chat Interface SHALL display an error message if the API call fails.

### Requirement 4: Persona Switcher

**User Story:** As a user, I want to switch between personas, so that I can have conversations with different characters.

#### Acceptance Criteria

1. THE Persona Switcher SHALL display three selectable options, one for each persona (Anshuman Singh, Abhimanyu Saxena, Kshitij Mishra).
2. THE Persona Switcher SHALL use AI Elements `Persona` component to display animated persona visuals that respond to chat states (idle, listening, thinking, speaking).
3. THE Persona Switcher SHALL clearly indicate the currently active persona.
4. WHEN a user selects a different persona, THE System SHALL reset the conversation history to empty.
5. WHEN a user selects a different persona, THE System SHALL load the new persona's system prompt for subsequent API calls.
6. THE Persona Switcher SHALL be visible at all times during the user's session.

### Requirement 5: Suggestion Chips

**User Story:** As a user, I want quick-start questions suggested by the persona, so that I can start a conversation easily.

#### Acceptance Criteria

1. THE System SHALL use AI Elements `Suggestions` and `Suggestion` components for displaying quick-start questions.
2. THE Suggestion Chips SHALL be specific to the currently selected persona.
3. THE Suggestion Chips SHALL contain a minimum of 3 questions relevant to each persona's expertise.
4. WHEN a user clicks a suggestion chip, THE Chat Interface SHALL call `sendMessage` with the suggestion text automatically.
5. THE Suggestion Chips SHALL be hidden after the user sends their first message in a conversation.

### Requirement 6: Typing Indicator

**User Story:** As a user, I want to see visual feedback while waiting for a response, so that I know the system is processing my request.

#### Acceptance Criteria

1. THE Chat Interface SHALL use AI Elements `Persona` component with state="thinking" to indicate processing.
2. WHEN the user sends a message (status="submitted"), THE Persona SHALL display the "thinking" state animation.
3. WHEN streaming response (status="streaming"), THE Persona SHALL display the "speaking" state animation.
4. WHEN the API response is complete (status="ready"), THE Persona SHALL return to "idle" state.
5. IF the API call fails (status="error"), THE Chat Interface SHALL display an error message.

### Requirement 7: Mobile Responsiveness

**User Story:** As a mobile user, I want the chat interface to work well on my device, so that I can have conversations on the go.

#### Acceptance Criteria

1. THE Chat Interface SHALL be fully functional on devices with a viewport width of 320px or greater.
2. THE Persona Switcher SHALL be usable on touch devices with tap interactions.
3. THE Chat message list SHALL adapt to smaller screens without horizontal scrolling.
4. THE Input field SHALL be easily accessible and usable on mobile devices.
5. THE Suggestion Chips SHALL wrap to multiple lines on smaller screens.
6. THE Typing Indicator SHALL be visible and appropriately sized on mobile devices.

### Requirement 8: Environment Configuration

**User Story:** As a developer, I want to configure the API key through environment variables, so that sensitive credentials are not exposed in the source code.

#### Acceptance Criteria

1. THE System SHALL use the @persona-chat/env package for environment variable management.
2. THE System SHALL require the `GOOGLE_API_KEY` environment variable to be set for LLM API calls.
3. THE Project SHALL include a `.env.example` file documenting all required environment variables without exposing actual values.
4. THE System SHALL validate that `GOOGLE_API_KEY` is present at runtime and return a clear error if it is missing.
5. THE Source code SHALL NOT contain any hardcoded API keys or credentials.

### Requirement 9: Error Handling

**User Story:** As a user, I want to see clear error messages when something goes wrong, so that I understand what happened and can try again.

#### Acceptance Criteria

1. WHEN an API error occurs, THE Chat Interface SHALL display a user-friendly error message and SHALL NOT crash.
2. WHEN a network error occurs, THE Chat Interface SHALL display "Connection error. Please check your internet and try again."
3. WHEN the user sends an empty message, THE Chat Interface SHALL prevent submission and SHALL NOT call the API.
4. THE Chat Interface SHALL handle rapid message submissions by disabling the input until the current request completes.

### Requirement 10: Message Format

**User Story:** As a developer, I want to ensure messages are properly formatted, so that the conversation displays correctly.

#### Acceptance Criteria

1. EACH message SHALL use AI SDK UIMessage format (managed by useChat):
   - `id`: Unique identifier (string)
   - `role`: "user" or "assistant" (string)
   - `parts`: Array of `{ type: 'text', text: string }`
2. THE Conversation history SHALL be managed by AI SDK `useChat` hook and automatically passed to the API.
3. WHEN the persona switches, THE conversation history SHALL be cleared (call useChat setMessages([]) or remount).
