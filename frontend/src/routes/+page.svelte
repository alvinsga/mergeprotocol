<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { Shield, Zap, DollarSign, Star } from 'lucide-svelte';

	const features = [
		{
			icon: Shield,
			title: 'Secure Licensing',
			description:
				'Protect your intellectual property with blockchain-backed licenses, ensuring tamper-proof and verifiable ownership.'
		},
		{
			icon: Zap,
			title: 'Easy Integration',
			description:
				'Seamlessly add licenses to your existing NFTs with our user-friendly interface and step-by-step guidance.'
		},
		{
			icon: DollarSign,
			title: 'New Revenue Streams',
			description:
				'Unlock multiple monetization avenues for your NFTs, from commercial licensing to limited-use permissions.'
		}
	];

	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { shortenAddress } from '$lib/helpers';

	let showAttributes = false;

	onMount(() => {
		setTimeout(() => {
			showAttributes = true;
		}, 500);
	});
</script>

<div class="p-12 mx-auto max-w-4xl text-center">
	<div class="text-8xl font-bold mt-24">Merge Network</div>
	<div class="flex items-center justify-center mt-4">
		<img src="aptos-logo.svg" alt="Aptos Logo" class="h-5 w-5 mr-2" />
		<a href="https://aptosfoundation.org/" target="_blank" class="text-sm">Powered by Aptos</a>
	</div>
	<div class="text-3xl mt-12">Unlock the full potential of your digital assets</div>
	<Button href="/app" class="mt-8">Go To App</Button>
</div>

<section class="p-8">
	<div class="container mx-auto">
		<div class="max-w-2xl mx-auto">
			<video class="w-full rounded-lg shadow-xl" autoplay loop muted playsinline>
				<source src="video.mp4" type="video/mp4" />
				Your browser does not support the video tag.
			</video>
			{#if showAttributes}
				<div class="mt-4 space-y-2 text-sm" transition:fly={{ y: -20, duration: 300 }}>
					<div class=" p-4 rounded-lg">
						<div class="text-xs text-gray-600">On-chain licences</div>
						<div class="font-medium relative group inline-block">
							Personal
							<div
								class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute z-10 bg-white border border-gray-200 rounded-md shadow-md p-4 left-full top-1/2 transform -translate-y-1/2 ml-2 w-64 text-sm"
							>
								<p>Price: $0</p>
								<p>Validity: Unlimited</p>
							</div>
						</div>
						<div class="font-medium">Commercial</div>
						<div class="text-xs text-gray-600 mt-5">Contract</div>
						<a href="google.com" class="underline underline-offset-2 font-medium"
							>{shortenAddress('0x34324234jh23j32434234234526457523n62344', 12)}</a
						>
						<div class="text-xs text-gray-600 mt-5">Owner</div>
						<a href="google.com" class="underline underline-offset-2 font-medium"
							>{shortenAddress('0x3244njkjk234234n23k234km342', 12)}</a
						>
					</div>
				</div>
			{/if}
		</div>
	</div>
</section>

<div class="flex flex-col min-h-screen mb-72">
	<main class="flex-grow">
		<section class="bg-white py-16 md:py-24">
			<div class="max-w-3xl mx-auto px-4">
				<div class="grid gap-y-72">
					{#each features as feature}
						<div class="flex flex-col justify-center items-center">
							<div class="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
								<svelte:component this={feature.icon} class="h-10 w-10 text-black" />
							</div>
							<h3 class="text-2xl mt-8">{feature.title}</h3>
							<div class="text-5xl text-center tracking-wide mt-12">
								<p>{feature.description}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>
	</main>
</div>
