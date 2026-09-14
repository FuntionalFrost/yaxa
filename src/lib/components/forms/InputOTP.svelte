<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		length?: number;
		value?: string;
		type?: 'number' | 'text' | 'password';
		disabled?: boolean;
		autofocus?: boolean;
		placeholder?: string;
		size?: 'sm' | 'md' | 'lg';
		separator?: boolean;
		separatorIndex?: number;
		class?: string;
		oncomplete?: (code: string) => void;
		onchange?: (code: string) => void;
	}

	let {
		length = 6,
		value = $bindable(''),
		type = 'number',
		disabled = false,
		autofocus = false,
		placeholder = '•',
		size = 'md',
		separator = true,
		separatorIndex = 3,
		class: className = '',
		oncomplete,
		onchange
	}: Props = $props();

	let inputRefs: HTMLInputElement[] = $state([]);

	// Initialize or normalize slots
	let slots = $derived.by(() => {
		const chars = value.split('');
		const arr: string[] = [];
		for (let i = 0; i < length; i++) {
			arr.push(chars[i] || '');
		}
		return arr;
	});

	function handleInput(e: Event, index: number) {
		const target = e.target as HTMLInputElement;
		const char = target.value.slice(-1);

		if (type === 'number' && char && !/^\d$/.test(char)) {
			target.value = slots[index] || '';
			return;
		}

		const chars = value.split('');
		chars[index] = char;
		const newValue = chars.slice(0, length).join('');
		value = newValue;
		onchange?.(newValue);

		if (char && index < length - 1) {
			inputRefs[index + 1]?.focus();
			inputRefs[index + 1]?.select();
		}

		if (newValue.length === length && !newValue.includes('')) {
			oncomplete?.(newValue);
		}
	}

	function handleKeyDown(e: KeyboardEvent, index: number) {
		if (e.key === 'Backspace') {
			if (!slots[index] && index > 0) {
				e.preventDefault();
				const chars = value.split('');
				chars[index - 1] = '';
				value = chars.join('');
				onchange?.(value);
				inputRefs[index - 1]?.focus();
			} else {
				const chars = value.split('');
				chars[index] = '';
				value = chars.join('');
				onchange?.(value);
			}
		} else if (e.key === 'ArrowLeft' && index > 0) {
			e.preventDefault();
			inputRefs[index - 1]?.focus();
			inputRefs[index - 1]?.select();
		} else if (e.key === 'ArrowRight' && index < length - 1) {
			e.preventDefault();
			inputRefs[index + 1]?.focus();
			inputRefs[index + 1]?.select();
		}
	}

	function handlePaste(e: ClipboardEvent) {
		e.preventDefault();
		const pasteData = e.clipboardData?.getData('text/plain') || '';
		let sanitized = pasteData.trim();
		if (type === 'number') {
			sanitized = sanitized.replace(/\D/g, '');
		}
		const truncated = sanitized.slice(0, length);
		value = truncated;
		onchange?.(truncated);

		const targetIdx = Math.min(truncated.length, length - 1);
		inputRefs[targetIdx]?.focus();

		if (truncated.length === length) {
			oncomplete?.(truncated);
		}
	}

	let sizeClasses = $derived.by(() => {
		switch (size) {
			case 'sm':
				return 'w-8 h-9 text-base';
			case 'lg':
				return 'w-14 h-16 text-2xl';
			case 'md':
			default:
				return 'w-11 h-12 text-xl';
		}
	});

	$effect(() => {
		if (autofocus && inputRefs[0]) {
			inputRefs[0].focus();
		}
	});
</script>

<div class={cn('flex items-center gap-2 select-none', className)}>
	{#each Array.from({ length }, (_, i) => i) as index}
		{#if separator && index === separatorIndex}
			<span class="px-1 font-bold text-neutral-400 select-none dark:text-neutral-600"> − </span>
		{/if}

		<input
			bind:this={inputRefs[index]}
			type={type === 'password' ? 'password' : 'text'}
			inputmode={type === 'number' ? 'numeric' : 'text'}
			pattern={type === 'number' ? '[0-9]*' : undefined}
			maxlength={1}
			value={slots[index]}
			placeholder={slots[index] ? '' : placeholder}
			{disabled}
			aria-label={`Digit ${index + 1} of ${length}`}
			class={cn(
				'rounded-lg border text-center font-mono font-semibold transition-all duration-150 outline-none',
				'border-neutral-300 bg-white text-neutral-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
				'dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-primary-400 dark:focus:ring-primary-400/20',
				'disabled:cursor-not-allowed disabled:opacity-50',
				slots[index] ? 'border-neutral-400 dark:border-neutral-500' : '',
				sizeClasses
			)}
			oninput={(e) => handleInput(e, index)}
			onkeydown={(e) => handleKeyDown(e, index)}
			onpaste={handlePaste}
			onfocus={(e) => e.currentTarget.select()}
		/>
	{/each}
</div>
