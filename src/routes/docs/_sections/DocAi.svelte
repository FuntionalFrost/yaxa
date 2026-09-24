<script lang="ts">
	import DocHeader from '../_components/DocHeader.svelte';
	import DocSandbox from '../_components/DocSandbox.svelte';
	import DocPropsTable from '../_components/DocPropsTable.svelte';
	import AiChat, { type AiMessage } from '$lib/components/ai/AiChat.svelte';
	import PromptBar from '$lib/components/ai/PromptBar.svelte';
	import AiThought from '$lib/components/ai/AiThought.svelte';
	import AiToolCall from '$lib/components/ai/AiToolCall.svelte';

	let samplePrompt = $state('');
	let sampleMessages = $state<AiMessage[]>([
		{
			id: '1',
			role: 'user',
			content: 'Can you analyze the database schema and summarize the active subscriptions?'
		},
		{
			id: '2',
			role: 'assistant',
			content:
				'I analyzed the schema and retrieved active organization subscriptions. You currently have 42 active Pro subscriptions and 8 Enterprise accounts.',
			thought: {
				duration: 1.8,
				steps: [
					'Introspected Drizzle schema',
					'Queried active subscriptions in PostgreSQL',
					'Calculated MRR metrics'
				]
			},
			tools: [
				{
					name: 'db_query_subscriptions',
					status: 'success',
					args: { status: 'active', limit: 50 },
					result: { count: 50, mrr: 14500 }
				}
			]
		}
	]);

	function handleSend(text: string) {
		sampleMessages = [
			...sampleMessages,
			{
				id: String(Date.now()),
				role: 'user',
				content: text
			},
			{
				id: String(Date.now() + 1),
				role: 'assistant',
				content: `Simulated response for: "${text}". Yaxa AI primitives support streaming, reasoning steps, and tool execution out of the box!`
			}
		];
	}
</script>

<div class="space-y-12">
	<DocHeader
		title="AI-Native Application Primitives"
		description="First-class Svelte 5 runes primitives for building generative AI chat interfaces, prompt bars, reasoning thought trees, and tool invocation cards."
		badge="AI Suite"
	/>

	<!-- Live AiChat Demo -->
	<section class="space-y-4">
		<h2 class="text-lg font-bold text-neutral-900 dark:text-white">
			Interactive AI Chat (&lt;AiChat /&gt;)
		</h2>
		<p class="text-xs text-neutral-500">
			Includes auto-scrolling message streams, assistant & user avatars, copy actions, collapsible
			reasoning thoughts, and tool call inspection.
		</p>

		<DocSandbox
			code={`<AiChat
  messages={sampleMessages}
  assistantName="Yaxa Copilot"
  onsend={(text) => handleSend(text)}
/>`}
		>
			<div class="h-[520px] w-full">
				<AiChat messages={sampleMessages} assistantName="Yaxa Copilot" onsend={handleSend} />
			</div>
		</DocSandbox>

		<DocPropsTable
			items={[
				{
					name: 'messages',
					type: 'AiMessage[]',
					default: '[]',
					description: 'Array of conversation messages with roles, thoughts, and tools'
				},
				{
					name: 'loading',
					type: 'boolean',
					default: 'false',
					description: 'Displays in-flight generation state and pulsing status'
				},
				{
					name: 'assistantName',
					type: 'string',
					default: "'AI Assistant'",
					description: 'Title displayed in the chat header'
				},
				{
					name: 'onsend',
					type: '(text: string, files?: File[]) => void',
					default: 'undefined',
					description: 'Callback triggered when user submits a prompt'
				}
			]}
		/>
	</section>

	<!-- Standalone PromptBar -->
	<section class="space-y-4">
		<h2 class="text-lg font-bold text-neutral-900 dark:text-white">
			Prompt Input Bar (&lt;PromptBar /&gt;)
		</h2>
		<p class="text-xs text-neutral-500">
			Auto-expanding textarea with file dropzone attachments, voice microphone toggle, and
			slash-command autocompletion (`/`).
		</p>

		<DocSandbox
			code={`<PromptBar
  bind:value={prompt}
  placeholder="Type / for commands..."
  onsubmit={(text, files) => console.log(text, files)}
/>`}
		>
			<div class="max-w-2xl py-2">
				<PromptBar
					bind:value={samplePrompt}
					placeholder="Type / for commands or ask anything..."
					onsubmit={(text) => handleSend(text)}
				/>
			</div>
		</DocSandbox>
	</section>

	<!-- Thought & Tool Primitives -->
	<section class="space-y-4">
		<h2 class="text-lg font-bold text-neutral-900 dark:text-white">
			Reasoning & Tool Execution Cards
		</h2>

		<DocSandbox
			code={`<AiThought duration={2.4} open={true} steps={['Parsed user intent', 'Resolved schema types']}>
  <p>Detailed inner reasoning text and deductions...</p>
</AiThought>

<AiToolCall
  name="generate_report"
  status="success"
  args={{ format: 'pdf', range: '30d' }}
  result={{ url: 'https://cdn.example.com/report.pdf' }}
/>`}
		>
			<div class="max-w-xl space-y-4 py-2">
				<AiThought
					duration={2.4}
					open={true}
					steps={['Parsed user intent', 'Resolved schema types']}
				>
					<p>Model reasoning and analysis steps...</p>
				</AiThought>

				<AiToolCall
					name="generate_report"
					status="success"
					args={{ format: 'pdf', range: '30d' }}
					result={{ url: 'https://cdn.example.com/report.pdf' }}
				/>
			</div>
		</DocSandbox>
	</section>
</div>
