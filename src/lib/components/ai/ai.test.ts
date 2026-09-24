import { describe, it, expect } from 'vitest';
import AiChat from './AiChat.svelte';
import PromptBar from './PromptBar.svelte';
import AiThought from './AiThought.svelte';
import AiToolCall from './AiToolCall.svelte';

describe('AI-Native Components', () => {
	it('should export all AI component definitions', () => {
		expect(AiChat).toBeDefined();
		expect(PromptBar).toBeDefined();
		expect(AiThought).toBeDefined();
		expect(AiToolCall).toBeDefined();
	});
});
