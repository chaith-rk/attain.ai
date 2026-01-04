# LLM Call Sites

| Location | Purpose | Trigger |
|----------|---------|---------|
| `app/api/chat/route.ts` | Primary coaching responses; handles intents/actions proposals with tools and streams text | Every user chat message |
| `app/api/confirm-intent/route.ts` | Generates supportive notes after an action is confirmed (<=200 chars) | When user clicks Confirm on an action update |
