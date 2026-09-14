<script lang="ts">
	import Icon, { type IconSource } from '../elements/Icon.svelte';
	import Badge from '../elements/Badge.svelte';
	import { cn } from '$lib/utils/cn';

	export interface ToggleItem {
		value: string;
		label: string;
		icon?: IconSource;
		badge?: string;
		disabled?: boolean;
	}

	interface Props {
		items: (ToggleItem | string)[];
		value?: string | string[];
		multiple?: boolean;
		size?: 'sm' | 'md' | 'lg';
		variant?: 'solid' | 'outline' | 'subtle';
		block?: boolean;
		disabled?: boolean;
		class?: string;
		onchange?: (value: string | string[]) => void;
	}

	let {
		items = [],
		value = $bindable(),
		multiple = false,
		size = 'md',
		variant = 'solid',
		block = false,
		disabled = false,
		class: className = '',
		onchange
	}: Props = $props();

	let normalizedItems = $derived<ToggleItem[]>(
		items.map((item) => {
			if (typeof item === 'string') {
				return { value: item, label: item };
			}
			return item;
		})
	);

	function isSelected(itemVal: string): boolean {
		if (multiple && Array.isArray(value)) {
			return value.includes(itemVal);
		}
		if (value === undefined && normalizedItems.length > 0 && !multiple) {
			return normalizedItems[0]?.value === itemVal;
		}
		return value === itemVal;
	}

	function handleSelect(itemVal: string) {
		if (disabled) return;
		if (multiple) {
			const current = Array.isArray(value) ? [...value] : [];
			const idx = current.indexOf(itemVal);
			if (idx > -1) {
				current.splice(idx, 1);
			} else {
				current.push(itemVal);
			}
			value = current;
			onchange?.(current);
		} else {
			value = itemVal;
			onchange?.(itemVal);
		}
	}

	let sizeClasses = $derived.by(() => {
		switch (size) {
			case 'sm':
				return {
					container: 'p-0.5 gap-0.5 rounded-lg text-xs',
					item: 'px-2.5 py-1 text-xs gap-1.5'
				};
			case 'lg':
				return {
					container: 'p-1.5 gap-1.5 rounded-xl text-base',
					item: 'px-4 py-2 text-base gap-2'
				};
			case 'md':
			default:
				return { container: 'p-1 gap-1 rounded-lg text-sm', item: 'px-3 py-1.5 text-sm gap-2' };
		}
	});

	let containerVariantClasses = $derived.by(() => {
		switch (variant) {
			case 'outline':
				return 'border border-neutral-200 bg-transparent dark:border-neutral-800';
			case 'subtle':
				return 'bg-neutral-100/70 dark:bg-neutral-900/70 border border-neutral-200/50 dark:border-neutral-800/50';
			case 'solid':
			default:
				return 'bg-neutral-100 dark:bg-neutral-800/80';
		}
	});
</script>

<div
	role="group"
	class={cn(
		'inline-flex items-center select-none',
		block ? 'flex w-full' : '',
		sizeClasses.container,
		containerVariantClasses,
		disabled ? 'cursor-not-allowed opacity-50' : '',
		className
	)}
>
	{#each normalizedItems as item}
		{@const selected = isSelected(item.value)}
		{@const itemDisabled = disabled || item.disabled}
		<button
			type="button"
			disabled={itemDisabled}
			onclick={() => handleSelect(item.value)}
			aria-pressed={selected}
			class={cn(
				'yaxa-press relative z-10 inline-flex items-center justify-center rounded-md font-medium transition-all duration-150',
				block ? 'flex-1' : '',
				sizeClasses.item,
				selected
					? 'bg-white font-semibold text-neutral-900 shadow-xs dark:bg-neutral-900 dark:text-neutral-50'
					: 'text-neutral-600 hover:bg-neutral-200/40 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700/40 dark:hover:text-neutral-100',
				itemDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
			)}
		>
			{#if item.icon}
				<Icon name={item.icon} size={size === 'sm' ? 'xs' : 'sm'} />
			{/if}
			<span>{item.label}</span>
			{#if item.badge}
				<Badge
					size="sm"
					variant={selected ? 'solid' : 'soft'}
					color={selected ? 'primary' : 'neutral'}
					class="ml-0.5 px-1.5 py-0 text-[10px]"
				>
					{item.badge}
				</Badge>
			{/if}
		</button>
	{/each}
</div>
