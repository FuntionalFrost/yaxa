<script lang="ts">
	import DocHeader from '../_components/DocHeader.svelte';
	import DocSandbox from '../_components/DocSandbox.svelte';
	import DocPropsTable from '../_components/DocPropsTable.svelte';
	import FormField from '$lib/components/forms/FormField.svelte';
	import Input from '$lib/components/forms/Input.svelte';
	import InputOTP from '$lib/components/forms/InputOTP.svelte';
	import Textarea from '$lib/components/forms/Textarea.svelte';
	import Select from '$lib/components/forms/Select.svelte';
	import Switch from '$lib/components/forms/Switch.svelte';
	import Checkbox from '$lib/components/forms/Checkbox.svelte';
	import RadioGroup from '$lib/components/forms/RadioGroup.svelte';
	import Slider from '$lib/components/forms/Slider.svelte';
	import ColorPicker from '$lib/components/forms/ColorPicker.svelte';
	import ToggleGroup from '$lib/components/forms/ToggleGroup.svelte';
	import DatePicker from '$lib/components/forms/DatePicker.svelte';
	import DateRangePicker from '$lib/components/forms/DateRangePicker.svelte';
	import Dropzone from '$lib/components/forms/Dropzone.svelte';
	import Combobox, { type ComboboxOption } from '$lib/components/forms/Combobox.svelte';
	import MultiSelect, { type MultiSelectOption } from '$lib/components/forms/MultiSelect.svelte';
	import NumberInput from '$lib/components/forms/NumberInput.svelte';
	import Badge from '$lib/components/elements/Badge.svelte';

	let sampleEmail = $state('user@yaxa.dev');
	let sampleRole = $state('developer');
	let autoGrowBio = $state(
		'This textarea auto-sizes dynamically as you type more lines without scrollbars.'
	);
	let dropzoneFiles = $state<File[]>([]);
	let enableTelemetry = $state(true);
	let acceptTerms = $state(true);
	let selectedTier = $state('pro');
	let volume = $state(75);
	let chosenHex = $state('#ff3e00');

	let selectedFramework = $state('svelte');
	let selectedSkills = $state<string[]>(['svelte', 'tailwind']);
	let itemQuantity = $state(3);

	const frameworkOptions: ComboboxOption[] = [
		{ label: 'Svelte 5', value: 'svelte', description: 'Runes-driven high performance UI' },
		{ label: 'SvelteKit 2', value: 'sveltekit', description: 'Full-stack meta-framework' },
		{ label: 'Tailwind CSS v4', value: 'tailwind', description: 'Utility-first modern CSS engine' },
		{ label: 'TypeScript', value: 'typescript', description: 'Typed JavaScript' },
		{ label: 'Vite', value: 'vite', description: 'Next-gen frontend tooling' }
	];

	const skillOptions: MultiSelectOption[] = [
		{ label: 'Svelte 5', value: 'svelte' },
		{ label: 'Tailwind CSS', value: 'tailwind' },
		{ label: 'TypeScript', value: 'ts' },
		{ label: 'PostgreSQL', value: 'postgres' },
		{ label: 'Drizzle ORM', value: 'drizzle' },
		{ label: 'Docker', value: 'docker' }
	];

	let otpValue = $state('482910');
	let otpResult = $state('');

	let billingInterval = $state('yearly');
	let singleDate = $state('2026-10-24');
	let dateRange = $state<{ start?: string; end?: string }>({
		start: '2026-10-01',
		end: '2026-10-15'
	});

	const roleOptions = [
		{ label: 'Frontend Developer', value: 'developer' },
		{ label: 'Product Designer', value: 'designer' },
		{ label: 'Engineering Manager', value: 'manager' }
	];

	const tierOptions = [
		{ label: 'Free Tier', value: 'free', description: 'Up to 3 projects, community support.' },
		{ label: 'Pro Plan', value: 'pro', description: 'Unlimited projects, priority SLA.' },
		{ label: 'Enterprise', value: 'enterprise', description: 'Custom SSO, dedicated support.' }
	];

	const billingOptions = [
		{ value: 'monthly', label: 'Monthly' },
		{ value: 'yearly', label: 'Yearly', badge: 'Save 20%' }
	];

	const formSnippet = `<FormField label="Email Address" required hint="We will never share your email">
  <Input type="email" bind:value={email} placeholder="you@company.com" icon="envelope" />
</FormField>

<FormField label="Bio" hint="Max 200 characters">
  <Textarea bind:value={bio} maxCount={200} showCount />
</FormField>`;

	const comboboxSnippet = `<Combobox
  options={frameworkOptions}
  bind:value={selectedFramework}
  placeholder="Search framework..."
  searchPlaceholder="Filter options..."
/>

<MultiSelect
  options={skillOptions}
  bind:value={selectedSkills}
  placeholder="Select team skills..."
/>

<NumberInput
  bind:value={itemQuantity}
  min={1}
  max={100}
  step={1}
/>`;

	const otpSnippet = `<InputOTP
  length={6}
  bind:value={otpCode}
  oncomplete={(code) => alert('Verified code: ' + code)}
/>`;

	const datePickerSnippet = `<!-- Single Date Picker -->
<DatePicker bind:value={singleDate} placeholder="Select project launch date" />

<!-- Date Range Picker with Presets -->
<DateRangePicker bind:value={dateRange} placeholder="Select analytics reporting window" />`;

	const superformsSnippet = `<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import { Form, FormField, Input, Select, Checkbox, Button } from 'yaxa-svelte';

  let { data } = $props();
  const superform = superForm(data.form);
${'<'}/script>

<!-- All child FormFields and controls automatically inherit error states and ARIA attrs -->
<Form {superform} errorSummary={true}>
  <FormField name="email" label="Email Address">
    <Input placeholder="alex@company.com" icon="envelope" />
  </FormField>

  <FormField name="role" label="Account Role">
    <Select options={roleOptions} />
  </FormField>

  <FormField name="terms">
    <Checkbox label="I agree to terms of service" />
  </FormField>

  <Button type="submit" color="primary">Save Changes</Button>
</Form>`;
</script>

<DocHeader
	title="Forms, Inputs & Pickers"
	description="Typed FormFields with validation states, Superforms context auto-wiring, character counters, OTP/2FA code inputs, Comboboxes, MultiSelect chips, NumberInputs, ToggleGroups, DatePickers, switches, checkboxes, and sliders."
	badge="Forms"
	source="src/lib/components/forms/FormField.svelte"
	category="Components"
	importStatement={"import { Form, FormField, Input, Select, Combobox, MultiSelect, NumberInput, Checkbox, Switch, DatePicker } from 'yaxa-svelte';"}
/>

<div class="space-y-8">
	<!-- Superforms Context Auto-Wiring Showcase -->
	<DocSandbox title="Zero-Boilerplate Superforms Auto-Wiring" code={superformsSnippet}>
		<div class="w-full max-w-lg space-y-4">
			<div
				class="rounded-xl border border-primary-200 bg-primary-50/50 p-4 text-xs text-primary-950 dark:border-primary-900/50 dark:bg-primary-950/20 dark:text-primary-200"
			>
				<strong class="font-semibold">Context Auto-Wiring:</strong> When placed inside a
				<code class="rounded bg-primary-100 px-1 py-0.5 font-mono dark:bg-primary-900"
					>&lt;Form &#123;superform&#125;&gt;</code
				>
				and
				<code class="rounded bg-primary-100 px-1 py-0.5 font-mono dark:bg-primary-900"
					>&lt;FormField name="field"&gt;</code
				>, all inputs (<code class="font-mono">Input</code>, <code class="font-mono">Select</code>,
				<code class="font-mono">Combobox</code>, <code class="font-mono">Checkbox</code>, etc.)
				automatically receive their <code class="font-mono">id</code>,
				<code class="font-mono">name</code>, <code class="font-mono">aria-describedby</code>, and
				reactive error highlights without manual prop plumbing.
			</div>

			<FormField
				label="Email Address"
				name="email"
				required
				hint="Automatically receives validation errors"
			>
				<Input
					type="email"
					bind:value={sampleEmail}
					placeholder="name@company.com"
					icon="envelope"
				/>
			</FormField>

			<FormField label="Select Role" name="role" required>
				<Select options={roleOptions} bind:value={sampleRole} />
			</FormField>
		</div>
	</DocSandbox>

	<!-- FormField & Inputs Sandbox -->
	<DocSandbox title="FormField, Input & Textarea" code={formSnippet}>
		<div class="w-full max-w-lg space-y-4">
			<FormField label="Work Email Address" required hint="We'll send your activation key here">
				<Input
					type="email"
					bind:value={sampleEmail}
					placeholder="name@company.com"
					icon="envelope"
				/>
			</FormField>

			<FormField label="Select Role" required>
				<Select options={roleOptions} bind:value={sampleRole} />
			</FormField>

			<FormField
				label="Developer Bio (Auto-Sizing Height)"
				hint="Expands automatically without scrollbars as you type"
			>
				<Textarea bind:value={autoGrowBio} autosize />
			</FormField>
		</div>
	</DocSandbox>

	<!-- Searchable Combobox & MultiSelect Sandboxes -->
	<DocSandbox title="Combobox, MultiSelect & NumberInput" code={comboboxSnippet}>
		<div class="w-full max-w-lg space-y-6">
			<FormField
				label="Searchable Framework (Combobox)"
				hint="Filterable options with keyboard navigation and clear button"
			>
				<Combobox
					options={frameworkOptions}
					bind:value={selectedFramework}
					placeholder="Select target framework..."
					searchPlaceholder="Filter framework list..."
				/>
			</FormField>

			<FormField
				label="Team Tech Stack (MultiSelect)"
				hint="Chip-based multi-selection with backspace removal"
			>
				<MultiSelect
					options={skillOptions}
					bind:values={selectedSkills}
					placeholder="Add technologies..."
				/>
			</FormField>

			<FormField label="Team Seats (NumberInput)" hint="Numeric stepper with min=1, max=50, step=1">
				<NumberInput bind:value={itemQuantity} min={1} max={50} step={1} />
			</FormField>
		</div>
	</DocSandbox>

	<!-- File Upload Dropzone -->
	<DocSandbox title="File Drag & Drop (<Dropzone />)">
		<div class="w-full max-w-lg space-y-4">
			<div class="space-y-1">
				<div class="text-sm font-semibold text-neutral-900 dark:text-white">
					Cloud File Upload Target
				</div>
				<p class="text-xs text-neutral-500">
					Direct drag-and-drop target with file previews, size limits, and S3 / Cloudflare R2
					presigned uploads.
				</p>
			</div>

			<Dropzone
				accept="image/*,application/pdf"
				multiple={true}
				bind:files={dropzoneFiles}
				label="Drop assets here or click to browse"
				description="PNG, JPG, SVG, or PDF up to 10MB"
			/>
		</div>
	</DocSandbox>

	<!-- InputOTP (2FA / Verification) -->
	<DocSandbox title="InputOTP (2FA & One-Time Code Input)" code={otpSnippet}>
		<div class="w-full max-w-lg space-y-4">
			<div class="space-y-1">
				<div class="text-sm font-semibold text-neutral-900 dark:text-white">
					Two-Factor Authentication Code
				</div>
				<p class="text-xs text-neutral-500">
					Supports auto-paste, backspace focus navigation, and mobile numeric keyboard.
				</p>
			</div>

			<InputOTP
				length={6}
				bind:value={otpValue}
				oncomplete={(code) => (otpResult = `Authenticated with: ${code}`)}
			/>

			{#if otpResult}
				<div class="flex items-center gap-2">
					<Badge color="success" variant="soft" size="sm">✓ {otpResult}</Badge>
				</div>
			{/if}
		</div>
	</DocSandbox>

	<!-- ToggleGroup (Segmented Controls) -->
	<DocSandbox title="ToggleGroup (Segmented Controls & Tab Selectors)">
		<div class="w-full max-w-lg space-y-5">
			<div class="space-y-2">
				<div class="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
					Billing Cycle Selector
				</div>
				<ToggleGroup items={billingOptions} bind:value={billingInterval} size="md" />
			</div>

			<div class="space-y-2">
				<div class="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
					View Mode (Icons & Solid Variant)
				</div>
				<ToggleGroup
					items={[
						{ value: 'grid', label: 'Grid', icon: 'table' },
						{ value: 'list', label: 'List', icon: 'list' }
					]}
					value="grid"
					variant="subtle"
				/>
			</div>
		</div>
	</DocSandbox>

	<!-- DatePicker & DateRangePicker Sandbox -->
	<DocSandbox title="DatePicker & DateRangePicker" code={datePickerSnippet}>
		<div class="w-full max-w-lg space-y-5">
			<div class="space-y-2">
				<div class="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
					Single Date Picker (with Calendar Popover)
				</div>
				<DatePicker bind:value={singleDate} placeholder="Select scheduled deployment date" />
			</div>

			<div class="space-y-2">
				<div class="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
					Date Range Picker (with Preset Intervals)
				</div>
				<DateRangePicker bind:value={dateRange} placeholder="Filter metrics by date span" />
			</div>
		</div>
	</DocSandbox>

	<!-- Switches, Checkboxes & Sliders Sandbox -->
	<DocSandbox title="Switches, Checkboxes & Sliders">
		<div class="w-full max-w-lg space-y-6">
			<div class="flex items-center justify-between">
				<div>
					<div class="text-sm font-semibold text-neutral-900 dark:text-white">
						Telemetry & Analytics
					</div>
					<div class="text-xs text-neutral-500">Allow anonymous usage telemetry</div>
				</div>
				<Switch bind:checked={enableTelemetry} />
			</div>

			<div class="flex items-center gap-3">
				<Checkbox bind:checked={acceptTerms} label="I accept the open source license terms" />
			</div>

			<div class="space-y-2">
				<div class="flex items-center justify-between text-xs">
					<span class="font-semibold text-neutral-700 dark:text-neutral-300"
						>Layout Scale / Density</span
					>
					<span class="font-mono text-primary-600 dark:text-primary-400">{volume}%</span>
				</div>
				<Slider bind:value={volume} min={0} max={100} step={5} />
			</div>

			<div class="space-y-2">
				<div class="flex items-center justify-between text-xs">
					<span class="font-semibold text-neutral-700 dark:text-neutral-300"
						>Custom Brand Color</span
					>
					<span class="font-mono text-primary-600 dark:text-primary-400">{chosenHex}</span>
				</div>
				<ColorPicker bind:value={chosenHex} />
			</div>
		</div>
	</DocSandbox>

	<!-- RadioGroup Card Sandbox -->
	<DocSandbox title="RadioGroup Selection Cards">
		<div class="w-full max-w-lg">
			<RadioGroup options={tierOptions} bind:value={selectedTier} name="subscriptionTier" />
		</div>
	</DocSandbox>

	<!-- Props Table -->
	<DocPropsTable
		items={[
			{
				name: 'label',
				type: 'string',
				default: "''",
				description: 'Visible label text displayed above the control.'
			},
			{
				name: 'required',
				type: 'boolean',
				default: 'false',
				description: 'Renders a primary colored asterisk and marks accessibility required.'
			},
			{
				name: 'error',
				type: 'string',
				default: "''",
				description: 'Validation error message to display in red below the input.'
			},
			{
				name: 'hint',
				type: 'string',
				default: "''",
				description: 'Helper guidance text displayed below the field.'
			}
		]}
	/>
</div>
