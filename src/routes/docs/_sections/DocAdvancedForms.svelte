<script lang="ts">
	import DocHeader from '../_components/DocHeader.svelte';
	import DocSandbox from '../_components/DocSandbox.svelte';
	import RichTextEditor from '$lib/components/forms/RichTextEditor.svelte';
	import PhoneInput from '$lib/components/forms/PhoneInput.svelte';
	import CreditCardInput, { type CardBrand } from '$lib/components/forms/CreditCardInput.svelte';

	let sampleMarkdown = $state(`### Welcome to Yaxa
Write formatted text with **bold**, *italic*, lists, and code blocks.

- Real-time split preview
- Full Svelte 5 runes reactivity
- Clean output`);

	let phoneNumber = $state('5551234567');
	let phoneCountry = $state('US');

	let cardNumber = $state('4242 4242 4242 4242');
	let cardExpiry = $state('12/28');
	let cardCvc = $state('123');
	let detectedBrand = $state<CardBrand>('visa');
</script>

<div class="space-y-12">
	<DocHeader
		title="Advanced Form Controls & Specialized Inputs"
		description="Enterprise form controls including Markdown WYSIWYG editors, international phone numbers with country flags, and auto-formatted credit card inputs."
		badge="Forms"
	/>

	<!-- Rich Text Editor -->
	<section class="space-y-4">
		<h2 class="text-lg font-bold text-neutral-900 dark:text-white">
			Markdown & Rich Text Editor (&lt;RichTextEditor /&gt;)
		</h2>
		<p class="text-xs text-neutral-500">
			Accessible editing surface with toolbar formatting shortcuts, split write/preview modes, and
			markdown formatting.
		</p>

		<DocSandbox
			code={`<RichTextEditor
  bind:value={markdownContent}
  placeholder="Write your article..."
  minHeight={200}
/>`}
		>
			<div class="max-w-2xl py-2">
				<RichTextEditor bind:value={sampleMarkdown} minHeight={180} />
			</div>
		</DocSandbox>
	</section>

	<!-- Phone Input -->
	<section class="space-y-4">
		<h2 class="text-lg font-bold text-neutral-900 dark:text-white">
			International Phone Input (&lt;PhoneInput /&gt;)
		</h2>
		<p class="text-xs text-neutral-500">
			Searchable country code selector with flag emojis, dial code prefixes, and number masking.
		</p>

		<DocSandbox
			code={`<PhoneInput
  bind:value={phone}
  bind:countryCode={country}
/>`}
		>
			<div class="max-w-md py-2">
				<PhoneInput bind:value={phoneNumber} bind:countryCode={phoneCountry} />
				<div class="mt-2 text-xs text-neutral-500">
					Current: {phoneCountry} ({phoneNumber})
				</div>
			</div>
		</DocSandbox>
	</section>

	<!-- Credit Card Input -->
	<section class="space-y-4">
		<h2 class="text-lg font-bold text-neutral-900 dark:text-white">
			Credit Card Input with Brand Detection (&lt;CreditCardInput /&gt;)
		</h2>

		<DocSandbox
			code={`<CreditCardInput
  bind:cardNumber={card}
  bind:expiry={exp}
  bind:cvc={cvc}
  bind:cardBrand={brand}
/>`}
		>
			<div class="max-w-md py-2">
				<CreditCardInput
					bind:cardNumber
					bind:expiry={cardExpiry}
					bind:cvc={cardCvc}
					bind:cardBrand={detectedBrand}
				/>
				<div class="mt-2 text-xs text-neutral-500">
					Detected Brand: <span class="font-semibold text-primary-500 uppercase"
						>{detectedBrand}</span
					>
				</div>
			</div>
		</DocSandbox>
	</section>
</div>
