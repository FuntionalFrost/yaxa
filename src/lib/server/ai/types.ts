import type { RequestEvent } from '@sveltejs/kit';
import type { Guard } from '../endpoint/types';
import type { AiMessage, AiMessageThought, AiMessageTool } from '../../components/ai/AiChat.svelte';

export type { AiMessage, AiMessageThought, AiMessageTool };

export interface AiStreamChunk {
	type: 'text' | 'thought' | 'tool_call' | 'error' | 'done';
	delta?: string;
	thought?: AiMessageThought;
	tool?: AiMessageTool;
	error?: string;
	meta?: Record<string, unknown>;
}

export interface AiStreamContext {
	event: RequestEvent;
	messages: AiMessage[];
	user?: unknown;
	send: (chunk: AiStreamChunk) => void;
	signal: AbortSignal;
}

export type AiStreamHandlerFn = (
	ctx: AiStreamContext
) => Promise<void> | AsyncIterable<AiStreamChunk> | void;

export interface CreateAiStreamHandlerOptions {
	/**
	 * Custom handler logic to generate stream chunks.
	 * Can invoke any LLM provider (Gemini, Anthropic, OpenAI, local Ollama).
	 */
	handler?: AiStreamHandlerFn;
	/**
	 * Guards to secure the endpoint (e.g. `requireAuth()`, `requireRole('member')`, `rateLimit()`).
	 */
	guards?: Guard[];
	/**
	 * Realistic mock streamer for development, testing, and zero-config demos.
	 * Default: true if handler is omitted, false otherwise.
	 */
	mock?: boolean | { delayMs?: number };
	/**
	 * Optional lifecycle hooks.
	 */
	onStart?: (event: RequestEvent) => Promise<void> | void;
	onError?: (error: unknown, event: RequestEvent) => Promise<void> | void;
}
