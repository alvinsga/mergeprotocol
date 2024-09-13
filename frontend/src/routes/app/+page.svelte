<script lang="ts">
	import { shortenAddress } from '$lib/helpers';
	import type { IP } from '$lib/types.ts';
	import type { PageData } from './$types';

	export let data: PageData;

	const ipArray: IP[] = data.ipAssets;
</script>

<div class="mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
	<h1 class="text-3xl font-bold mb-6">Marketplace</h1>
	{#if ipArray.length > 0}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{#each ipArray as ip}
				<a
					href="/app/{ip.address}"
					class="bg-white rounded-lg shadow-md overflow-hidden block transition-transform duration-300 hover:scale-105"
				>
					<img src={ip.image} alt={ip.name} class="w-full h-48 object-cover" />
					<div class="p-4">
						<h3 class="text-lg font-semibold mb-2">{ip.name}</h3>
						<p class="text-sm text-gray-600 mb-1">Address: {shortenAddress(ip.address, 8)}</p>
						<p class="text-sm text-gray-600">License: {ip.license}</p>
					</div>
				</a>
			{/each}
		</div>
	{:else}
		<p class="mt-4 text-gray-600">No IP items available in the marketplace.</p>
	{/if}
</div>
