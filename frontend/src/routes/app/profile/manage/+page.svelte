<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { shortenAddress } from '$lib/helpers';
	import type { IP } from '$lib/types.ts';
	export let data;

	const ipAssets = data.ipAssets;
</script>

<div class="flex justify-between">
	<div class="text-2xl font-bold">Your IP</div>
</div>

<div class="mt-12 max-w-5xl mx-auto">
	{#if ipAssets.length > 0}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
			{#each ipAssets as ip}
				<div class="rounded-lg p-4 transition-all duration-300 hover:shadow-md hover:bg-gray-50">
					<img src={ip.image} alt={ip.name} class="w-full h-48 object-cover rounded-md mb-2" />
					<h3 class="text-lg font-semibold">{ip.name}</h3>
					<p class="text-sm text-gray-600">Address: {shortenAddress(ip.address, 12)}</p>
					<p class="text-sm text-gray-600">License: {ip.license}</p>
				</div>
			{/each}
		</div>
	{:else}
		<p class="mt-4 text-gray-600">No IP items available.</p>
	{/if}
	<div class="flex justify-between my-12">
		<div class="text-2xl font-bold">Your Licenses</div>
	</div>
</div>
