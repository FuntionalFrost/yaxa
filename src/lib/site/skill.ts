import type { RequestHandler } from '@sveltejs/kit';
import type { SiteConfig } from './config.js';

export interface SkillAction {
	name: string;
	description: string;
	endpoint?: string;
	parameters?: Record<string, string>;
}

export interface SkillOptions {
	config: SiteConfig;
	title?: string;
	description?: string;
	actions?: SkillAction[];
	customRules?: string[];
}

/**
 * Generates machine-readable Agent Skill markdown (SKILL.md / .cursorrules).
 * Teaches AI coding assistants (Cursor, Antigravity, Claude Code, Copilot) how to write
 * pure Svelte 5 runes and correctly use Yaxa UI components and endpoints.
 */
export function generateSkillMd(optionsOrConfig: SiteConfig | SkillOptions): string {
	const options: SkillOptions =
		'config' in optionsOrConfig ? optionsOrConfig : { config: optionsOrConfig };
	const { config, title, description, actions = [], customRules = [] } = options;

	const skillTitle = title || `${config.title || config.name} Agent Skill`;
	const skillDesc =
		description ||
		config.description ||
		'Standard guidelines and specifications for AI coding assistants working in this codebase.';

	let md = `# ${skillTitle}\n\n`;
	md += `> ${skillDesc}\n\n`;

	md += `## ⚡ Svelte 5 & SvelteKit Strict Rules\n\n`;
	md += `When writing code for this project, AI agents MUST follow these standards:\n\n`;
	md += `1. **Pure Runes Reactivity**: Use \`$state\`, \`$derived\`, \`$props\`, \`$bindable\`, and \`$effect\` exclusively.\n`;
	md += `   - NEVER use legacy Svelte 3/4 stores (\`writable\`, \`readable\`, \`$store\`).\n`;
	md += `   - NEVER use \`export let prop\`; use \`let { prop = defaultValue }: Props = $props();\` instead.\n`;
	md += `2. **Snippets over Slots**: Use \`{#snippet mySlot()}\` and \`{@render mySlot()}\` instead of \`<slot />\`.\n`;
	md += `3. **Event Handlers**: Use \`onclick={...}\`, \`onsubmit={...}\` rather than legacy \`on:click\` or \`on:submit\`.\n`;
	md += `4. **Type-Safe RPC & Queries**: Use \`createQuery\` and \`createMutation\` from \`yaxa-svelte\` for client caching.\n`;
	md += `5. **SEO & Page Meta**: Use \`useSeo(() => ({ title: '...', description: '...' }))\` from \`yaxa-svelte/seo\`.\n\n`;

	md += `## 🧩 Yaxa UI & Tailwind v4 Reference\n\n`;
	md += `- **Styling Engine**: Tailwind CSS v4 native tokens (\`@theme\`, harmonic radius \`--radius-*\`, series palette \`--color-chart-*\`).\n`;
	md += `- **Core Components**: \`Button\`, \`Badge\`, \`Input\`, \`DataTable\`, \`Modal\`, \`Drawer\`, \`Tabs\`, \`MetricCard\`, \`Skeleton\`.\n`;
	md += `- **Feedback**: Use \`const toast = useToast()\` with \`toast.success(title, message)\`.\n`;
	md += `- **Gating**: Use \`<Gate requiredPlan="pro">\` or \`const gate = useGate()\` for SaaS feature gating.\n\n`;

	if (actions.length > 0) {
		md += `## 🛠️ Project APIs & Action Capabilities\n\n`;
		for (const action of actions) {
			md += `### \`${action.name}\`\n`;
			md += `${action.description}\n\n`;
			if (action.endpoint) {
				md += `- **Endpoint**: \`${action.endpoint}\`\n`;
			}
			if (action.parameters) {
				md += `- **Parameters**:\n`;
				for (const [key, val] of Object.entries(action.parameters)) {
					md += `  - \`${key}\`: ${val}\n`;
				}
			}
			md += '\n';
		}
	}

	if (customRules.length > 0) {
		md += `## 📌 Custom Project Rules\n\n`;
		for (const rule of customRules) {
			md += `- ${rule}\n`;
		}
		md += '\n';
	}

	return md.trimEnd() + '\n';
}

/**
 * Creates a SvelteKit RequestHandler serving /skill.md or /.well-known/skill.md.
 * Compatible with pure static site generation (@sveltejs/adapter-static) via `export const prerender = true`.
 */
export function createSkillHandler(optionsOrConfig: SiteConfig | SkillOptions): RequestHandler {
	return async () => {
		const body = generateSkillMd(optionsOrConfig);
		return new Response(body, {
			headers: {
				'Content-Type': 'text/markdown; charset=utf-8',
				'Cache-Control': 'public, max-age=86400'
			}
		});
	};
}
